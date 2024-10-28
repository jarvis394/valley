import React, { useState } from 'react'
import styles from '../auth.module.css'
import Button from '@valley/ui/Button'
import {
  TOTP_PROVIDER_NAME,
  GITHUB_PROVIDER_NAME,
  GOOGLE_PROVIDER_NAME,
  PROVIDER_NAMES,
  ProviderName,
  VK_PROVIDER_NAME,
} from '../../../config/connections'
import Divider from '@valley/ui/Divider'
import Stack from '@valley/ui/Stack'
import { ArrowRight } from 'geist-ui-icons'
import Passkey from '../../../components/svg/Passkey'
import { ProviderConnectionForm } from '../../../components/ProviderConnectionForm/ProviderConnectionForm'
import {
  Form,
  json,
  redirect,
  useActionData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react'
import {
  doEmailAuthorization,
  requireAnonymous,
} from '../../../server/auth.server'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { exhaustivnessCheck } from '@valley/shared'
import Input from '@valley/ui/Input'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useIsPending } from '../../../utils/misc'
import { checkHoneypot } from '../../../server/honeypot.server'
import { z } from 'zod'
import { EmailSchema } from '../../../utils/user-validation'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { handleNewSession } from './login.server'

const EmailFormSchema = z.object({
  email: EmailSchema,
  redirectTo: z.string().optional(),
})

type AuthMethod = ProviderName | 'passkey'

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
      EmailFormSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, session: null }

        const session = await doEmailAuthorization({
          email: data.email,
          request,
        })
        if (!session) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Redirect to password login',
          })
          return z.NEVER
        }

        return { ...data, session }
      }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value.session) {
    // return json(
    //   { result: submission.reply({ hideFields: ['password'] }) },
    //   { status: submission.status === 'error' ? 400 : 200 }
    // )
    return redirect('/auth/login/email')
  }

  const { session, redirectTo } = submission.value

  return handleNewSession({
    request,
    session,
    redirectTo,
  })
}

const LoginPage: React.FC = () => {
  // const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  const isPending = useIsPending()
  const redirectTo = searchParams.get('redirectTo')
  const [form, fields] = useForm({
    id: 'login-form',
    constraint: getZodConstraint(EmailFormSchema),
    defaultValue: { redirectTo },
    // lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmailFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })
  const navigate = useNavigate()
  const [selectedAuthMethod, setSelectedAuthMethod] =
    useState<AuthMethod | null>(null)
  const isLoading = !!selectedAuthMethod

  const handleClick = (e: React.MouseEvent, authMethod: AuthMethod) => {
    e.preventDefault()

    switch (authMethod) {
      case GITHUB_PROVIDER_NAME:
      case GOOGLE_PROVIDER_NAME:
      case VK_PROVIDER_NAME:
      case 'passkey':
        return setSelectedAuthMethod(authMethod)
      case TOTP_PROVIDER_NAME:
        setSelectedAuthMethod(null)
        return navigate('/auth/login/email')
      default:
        return exhaustivnessCheck(authMethod)
    }
  }

  return (
    <main className={styles.auth__content}>
      <h1 className={styles.auth__contentHeader}>Enter the Valley</h1>
      <div className={styles.auth__form}>
        <Stack gap={2} style={{ width: '100%' }} direction={'column'}>
          {PROVIDER_NAMES.filter((e) => e !== TOTP_PROVIDER_NAME).map(
            (providerName) => (
              <ProviderConnectionForm
                key={providerName}
                providerName={providerName}
                type="Connect"
                buttonProps={{
                  disabled: isLoading,
                  loading: selectedAuthMethod === providerName,
                  onClick: (e: React.MouseEvent) =>
                    handleClick(e, providerName),
                }}
              />
            )
          )}
        </Stack>
        <Divider>OR</Divider>
        <Stack asChild gap={2} style={{ width: '100%' }} direction={'column'}>
          <Form {...getFormProps(form)} method="POST">
            <HoneypotInputs />
            {redirectTo ? (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            ) : null}
            <Input
              {...getInputProps(fields.email, {
                type: 'email',
              })}
              state={fields.email.errors ? 'error' : 'default'}
              required
              size="lg"
              placeholder="Email"
            />
            <Button
              fullWidth
              variant="primary"
              loading={isPending}
              disabled={isPending}
              size="lg"
              after={<ArrowRight />}
              type="submit"
            >
              Continue with Email
            </Button>
            <Button
              fullWidth
              before={<Passkey />}
              variant="secondary"
              loading={isLoading && selectedAuthMethod === 'passkey'}
              disabled={isLoading}
              onClick={(e: React.MouseEvent) => handleClick(e, 'passkey')}
              size="lg"
            >
              Login with Passkey
            </Button>
          </Form>
        </Stack>
      </div>
    </main>
  )
}

export default LoginPage
