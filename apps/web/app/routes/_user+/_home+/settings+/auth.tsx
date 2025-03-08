import {
  type ActionFunctionArgs,
  data,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import { Await, useLoaderData } from '@remix-run/react'
import Note from '@valley/ui/Note'
import Paper from '@valley/ui/Paper'
import Spinner from '@valley/ui/Spinner'
import Stack from '@valley/ui/Stack'
import ConnectionCard from 'app/components/ConnectionCard/ConnectionCard'
import { ProviderConnectionForm } from 'app/components/ProviderConnectionForm/ProviderConnectionForm'
import {
  PROVIDER_NAMES,
  ProviderName,
  ProviderNameSchema,
} from 'app/config/connections'
import { VerificationType } from 'app/routes/_.auth+/verify+'
import { requireUserId } from 'app/server/auth/auth.server'
import { resolveConnectionData } from 'app/server/auth/connections.server'
import { AuthProvider } from 'app/server/auth/providers/provider'
import { prisma } from 'app/server/db.server'
import { makeTimings } from 'app/server/timing.server'
import { createToastHeaders } from 'app/server/toast.server'
import { invariantResponse } from 'app/utils/invariant'
import dayjs from 'dayjs'
import React, { Suspense } from 'react'

export const twoFAVerificationType = '2fa' satisfies VerificationType
export const twoFAVerifyVerificationType = '2fa-verify'

export type ConnectionData = {
  providerName: ProviderName
  id: string
  alias: string
  displayName?: string
  link?: string | null
  createdAtFormatted: string
}

const userCanDeleteConnections = async (userId: string) => {
  const user = await prisma.user.findUnique({
    select: {
      password: { select: { userId: true } },
      _count: { select: { connections: true } },
    },
    where: { id: userId },
  })
  // user can delete their connections if they have a password
  if (user?.password) return true
  // users have to have more than one remaining connection to delete one
  return Boolean(user?._count.connections && user?._count.connections > 1)
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request)
  const timings = makeTimings('profile connections loader')
  const rawConnections = await prisma.connection.findMany({
    select: { id: true, providerName: true, providerId: true, createdAt: true },
    where: { userId },
  })
  const connections = new Promise<ConnectionData[]>((res) => {
    const result: ConnectionData[] = []
    const promises: Array<ReturnType<AuthProvider['resolveConnectionData']>> =
      []

    rawConnections.forEach(async (connection) => {
      const r = ProviderNameSchema.safeParse(connection.providerName)
      if (!r.success) return
      const providerName = r.data
      promises.push(
        resolveConnectionData(providerName, connection.providerId, { timings })
      )
      result.push({
        alias: providerName,
        providerName,
        id: connection.id,
        createdAtFormatted: dayjs(connection.createdAt).calendar(),
      })
    })

    Promise.all(promises).then((data) => {
      data.forEach((connectionData, i) => {
        result[i] = {
          ...result[i],
          ...connectionData,
        }
      })
      return res(result)
    })
  })

  return data(
    {
      connections,
      canDeleteConnections: userCanDeleteConnections(userId),
    },
    { headers: { 'Server-Timing': timings.toString() } }
  )
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  invariantResponse(
    formData.get('intent') === 'delete-connection',
    'Invalid intent'
  )
  invariantResponse(
    await userCanDeleteConnections(userId),
    'You cannot delete your last connection unless you have a password.'
  )
  const connectionId = formData.get('connectionId')
  invariantResponse(typeof connectionId === 'string', 'Invalid connectionId')
  await prisma.connection.delete({
    where: {
      id: connectionId,
      userId: userId,
    },
  })
  const toastHeaders = await createToastHeaders({
    title: 'Deleted',
    description: 'Your connection has been deleted.',
  })
  return data({ status: 'success' } as const, { headers: toastHeaders })
}

const Connections: React.FC<{
  data: ConnectionData[]
  canDeleteConnections: Promise<boolean>
}> = ({ data, canDeleteConnections }) => {
  if (data.length > 0) {
    return (
      <Stack direction={'column'}>
        {data.map((item) => (
          <ConnectionCard
            data={item}
            key={item.id}
            canDelete={canDeleteConnections}
          />
        ))}
      </Stack>
    )
  } else {
    return (
      <Note variant="default" fill className="fade-in">
        You don&apos;t have any connections yet.
      </Note>
    )
  }
}

const AccountSettingsAuthentication = () => {
  const data = useLoaderData<typeof loader>()
  return (
    <Stack gap={4} direction={'column'} fullWidth>
      <Stack asChild gap={3} direction={'column'} padding={4}>
        <Paper variant="border" rounded>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            Add New
          </h3>
          <Stack wrap gap={2}>
            {PROVIDER_NAMES.map((providerName) => (
              <ProviderConnectionForm
                key={providerName}
                redirectTo={'/settings/auth'}
                type="Connect"
                providerName={providerName}
              />
            ))}
          </Stack>
        </Paper>
      </Stack>
      <Suspense
        fallback={
          <Stack fullWidth justify={'center'} padding={2}>
            <Spinner />
          </Stack>
        }
      >
        <Await resolve={data.connections}>
          {(connections) => (
            <Connections
              data={connections}
              canDeleteConnections={data.canDeleteConnections}
            />
          )}
        </Await>
      </Suspense>
    </Stack>
  )
}

export default React.memo(AccountSettingsAuthentication)
