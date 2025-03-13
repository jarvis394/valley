import { data, type LoaderFunctionArgs } from '@remix-run/node'
import {
  Await,
  ShouldRevalidateFunction,
  useLoaderData,
} from '@remix-run/react'
import Note from '@valley/ui/Note'
import Paper from '@valley/ui/Paper'
import Spinner from '@valley/ui/Spinner'
import Stack from '@valley/ui/Stack'
import { ProviderConnectionForm } from 'app/components/ProviderConnectionForm/ProviderConnectionForm'
import {
  SOCIAL_PROVIDER_NAMES,
  ProviderName,
  PROVIDER_ICONS,
  PROVIDER_LABELS,
} from 'app/config/connections'
import { VerificationType } from 'app/routes/_.auth+/verify+'
import { requireUserId } from 'app/server/auth/auth.server'
import { makeTimings, time } from 'app/server/timing.server'
import React, { Suspense } from 'react'
import { auth } from '@valley/auth'
import AccountCard from 'app/components/AccountCard/AccountCard'
import Button from '@valley/ui/Button'

export const twoFAVerificationType = '2fa' satisfies VerificationType
export const twoFAVerifyVerificationType = '2fa-verify'

export type AccountData = {
  id: string
  provider: ProviderName
  createdAt: Date
  updatedAt: Date
  accountId: string
  scopes: string[]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request)
  const timings = makeTimings('user accounts loader')
  const accounts = time(
    () =>
      auth.api.listUserAccounts({
        headers: request.headers,
      }),
    {
      timings,
      type: 'user accounts',
    }
  )

  return data(
    { accounts },
    { headers: { 'Server-Timing': timings.toString() } }
  )
}

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return true
}

const Accounts: React.FC<{
  data: AccountData[] | null
}> = ({ data }) => {
  if (data && data.length > 0) {
    return (
      <Stack direction={'column'} className="fade-in">
        {data.map((item) => (
          <AccountCard canDelete={data.length > 1} data={item} key={item.id} />
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
            {SOCIAL_PROVIDER_NAMES.map((providerName) => (
              <ProviderConnectionForm
                key={providerName}
                redirectTo={'/settings/auth'}
                type="Connect"
                providerName={providerName}
                buttonProps={{ fullWidth: false }}
              />
            ))}
            <Button
              variant="secondary"
              size="lg"
              before={PROVIDER_ICONS['credential']}
            >
              {PROVIDER_LABELS['credential']}
            </Button>
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
        <Await resolve={data.accounts}>
          {(accounts) => <Accounts data={accounts as AccountData[]} />}
        </Await>
      </Suspense>
    </Stack>
  )
}

export default React.memo(AccountSettingsAuthentication)
