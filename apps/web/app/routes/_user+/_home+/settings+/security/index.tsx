import { data, type LoaderFunctionArgs } from '@remix-run/node'
import { ShouldRevalidateFunction, useLoaderData } from '@remix-run/react'
import Note from '@valley/ui/Note'
import Paper from '@valley/ui/Paper'
import Stack from '@valley/ui/Stack'
import { ProviderConnectionForm } from 'app/components/ProviderConnectionForm/ProviderConnectionForm'
import { SOCIAL_PROVIDER_NAMES, ProviderName } from 'app/config/connections'
import { VerificationType } from 'app/routes/_.auth+/verify+'
import { requireUserId } from 'app/server/auth/auth.server'
import { makeTimings, time } from 'app/server/timing.server'
import React from 'react'
import { auth } from '@valley/auth'
import AccountCard from 'app/components/AccountCard/AccountCard'
import Password from './Password'
import { action } from './security.server'
import { z } from 'zod'
import { PasswordSchema } from 'app/utils/user-validation'
import { zodResolver } from '@hookform/resolvers/zod'

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

export const UserSetPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    currentPassword: PasswordSchema.optional(),
    revokeOtherSessions: z.boolean().optional().default(false),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      })
    }
  })

export type FormData = z.infer<typeof UserSetPasswordSchema>
export const resolver = zodResolver(UserSetPasswordSchema)

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request)
  const timings = makeTimings('user accounts loader')
  const accounts = await time(
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

export { action }

const Accounts: React.FC<{
  data: AccountData[] | null
}> = ({ data }) => {
  if (data && data.length > 0) {
    return (
      <Stack direction={'column'}>
        {data.map((item) => (
          <AccountCard canDelete={data.length > 1} data={item} key={item.id} />
        ))}
      </Stack>
    )
  } else {
    return (
      <Note variant="default" fill>
        You don&apos;t have any connections yet.
      </Note>
    )
  }
}

const AddNewAccount = () => (
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
      </Stack>
    </Paper>
  </Stack>
)

const AccountSettingsSecurity = () => {
  const data = useLoaderData<typeof loader>()
  const accounts = data.accounts as AccountData[]

  return (
    <>
      <AddNewAccount />
      <Accounts data={accounts} />
      <Password data={accounts} />
    </>
  )
}

export default React.memo(AccountSettingsSecurity)
