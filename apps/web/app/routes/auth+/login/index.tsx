import React from 'react'
import styles from '../auth.module.css'
import Button from '@valley/ui/Button'
import { PROVIDER_NAMES } from '../../../config/connections'
import Divider from '@valley/ui/Divider'
import Stack from '@valley/ui/Stack'
import { ArrowRight } from 'geist-ui-icons'
import Passkey from '../../../components/svg/Passkey'
import { ProviderConnectionForm } from '../../../components/ProviderConnectionForm/ProviderConnectionForm'
import { Form, useSearchParams } from '@remix-run/react'
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  redirect,
  json,
} from '@remix-run/node'
import { requireAnonymous } from '../../../server/auth.server'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import Input from '@valley/ui/Input'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { getDomainUrl, useIsPending } from '../../../utils/misc'
import { checkHoneypot } from '../../../server/honeypot.server'
import { z } from 'zod'
import { EmailSchema } from '../../../utils/user-validation'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { handleNewSession } from './login.server'
import { redirectToKey, targetKey } from '../verify'

const EmailFormSchema = z.object({
  email: EmailSchema,
  redirectTo: z.string().optional(),
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
      EmailFormSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, session: null }

        // const session = await doEmailAuthorization({
        //   email: data.email,
        //   request,
        // })
        // if (!session) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Redirect to password login',
        })
        return z.NEVER
        // }

        // return { ...data, session }
      }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value.session) {
    const redirectToUrl = new URL(`${getDomainUrl(request)}/auth/login/email`)
    redirectToUrl.searchParams.set(
      targetKey,
      submission.payload.email.toString()
    )

    if (submission.payload.redirectTo) {
      redirectToUrl.searchParams.set(
        redirectToKey,
        submission.payload.redirectTo.toString()
      )
    }

    return redirect(redirectToUrl.toString())
  }

  const { session, redirectTo } = submission.value

  return handleNewSession({
    request,
    session,
    redirectTo,
  })
}

const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const isPending = useIsPending()
  const redirectTo = searchParams.get(redirectToKey)
  const target = searchParams.get(targetKey)
  const [form, fields] = useForm({
    id: 'login-form',
    constraint: getZodConstraint(EmailFormSchema),
    defaultValue: { redirectTo, email: target },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmailFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <main className={styles.auth__content}>
      <h1 className={styles.auth__contentHeader}>Enter the Valley</h1>
      <Stack fullWidth gap={3} direction={'column'}>
        <Stack
          gap={2}
          fullWidth
          direction={'column'}
          style={{ viewTransitionName: 'auth-providers' }}
        >
          {PROVIDER_NAMES.map((providerName) => (
            <ProviderConnectionForm
              key={providerName}
              providerName={providerName}
              type="Connect"
              redirectTo={redirectTo}
            />
          ))}
        </Stack>
        <Divider style={{ viewTransitionName: 'auth-divider' }}>OR</Divider>
        <Stack asChild gap={2} fullWidth direction={'column'}>
          <Form {...getFormProps(form)} viewTransition method="POST">
            <HoneypotInputs />
            {redirectTo && (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            )}
            <Input
              {...getInputProps(fields.email, {
                type: 'email',
              })}
              // We want to focus the field when user clicks "email edit" button on the next page
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={!!target}
              state={fields.email.errors ? 'error' : 'default'}
              required
              size="lg"
              placeholder="Email"
              paperProps={{
                style: { viewTransitionName: 'auth-form-email-input' },
              }}
            />
            <Button
              fullWidth
              loading={isPending}
              disabled={isPending}
              variant="primary"
              size="lg"
              type="submit"
              after={<ArrowRight />}
              style={{ viewTransitionName: 'auth-form-submit' }}
            >
              Continue with Email
            </Button>
            <Button
              fullWidth
              before={<Passkey />}
              variant="secondary"
              size="lg"
            >
              Login with Passkey
            </Button>
          </Form>
        </Stack>
      </Stack>
    </main>
  )
}

export default LoginPage
