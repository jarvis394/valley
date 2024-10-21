import React, { useState } from 'react'
import styles from '../auth.module.css'
import Button from '@valley/ui/Button'
import { PROVIDER_NAMES } from '../../../config/connections'
import Divider from '@valley/ui/Divider'
import Stack from '@valley/ui/Stack'
import { ArrowRight } from 'geist-ui-icons'
import Passkey from '../../../components/svg/Passkey'
import { ProviderConnectionForm } from '../../../components/ProviderConnectionForm/ProviderConnectionForm'
import { useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { json, useActionData, useSearchParams } from '@remix-run/react'
import { useIsPending } from '../../../utils/misc'
import { login, requireAnonymous } from '../../../server/auth.server'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { z } from 'zod'
import { UsernameSchema, PasswordSchema } from '../../../utils/user-validation'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { checkHoneypot } from '../../../server/honeypot.server'
import { handleNewSession } from '../login.server'

const LoginFormSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
  redirectTo: z.string().optional(),
  remember: z.boolean().optional(),
})

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request)
  const formData = await request.formData()
  checkHoneypot(formData)
  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, session: null }

        const session = await login(data)
        if (!session) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid username or password',
          })
          return z.NEVER
        }

        return { ...data, session }
      }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value.session) {
    return json(
      { result: submission.reply({ hideFields: ['password'] }) },
      { status: submission.status === 'error' ? 400 : 200 }
    )
  }

  const { session, remember, redirectTo } = submission.value

  return handleNewSession({
    request,
    session,
    remember: remember ?? false,
    redirectTo,
  })
}

const LoginPage: React.FC = () => {
  const actionData = useActionData<typeof action>()
  const isPending = useIsPending()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [form, fields] = useForm({
    id: 'login-form',
    constraint: getZodConstraint(LoginFormSchema),
    defaultValue: { redirectTo },
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  const handleClick = (provider: string) => {
    setIsLoading(true)
    setSelectedProvider(provider)
  }

  return (
    <main className={styles.auth__content}>
      <h1 className={styles.auth__contentHeader}>Log in to Valley</h1>
      <div className={styles.auth__form}>
        <Stack gap={2} style={{ width: '100%' }} direction={'column'}>
          {PROVIDER_NAMES.map((providerName) => (
            <ProviderConnectionForm
              key={providerName}
              providerName={providerName}
              type="Connect"
              buttonProps={{
                disabled: isLoading,
                loading: selectedProvider === providerName,
                onClick: handleClick.bind(null, providerName),
              }}
            />
          ))}
        </Stack>
        <Divider>OR</Divider>
        <Stack gap={2} style={{ width: '100%' }} direction={'column'}>
          <Button
            fullWidth
            variant="primary"
            loading={isLoading && selectedProvider === 'email'}
            disabled={isLoading}
            onClick={() => handleClick.bind(null, 'email')}
            size="lg"
            after={<ArrowRight />}
          >
            Continue with Email
          </Button>
          <Button
            fullWidth
            before={<Passkey />}
            variant="secondary"
            loading={isLoading && selectedProvider === 'passkey'}
            disabled={isLoading}
            onClick={handleClick.bind(null, 'passkey')}
            size="lg"
          >
            Login with Passkey
          </Button>
        </Stack>
      </div>
    </main>
  )
}

export default LoginPage
