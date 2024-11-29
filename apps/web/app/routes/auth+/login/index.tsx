import React from 'react'
import styles from '../auth.module.css'
import Button from '@valley/ui/Button'
import { PROVIDER_NAMES } from '../../../config/connections'
import Divider from '@valley/ui/Divider'
import Stack from '@valley/ui/Stack'
import { ArrowRight } from 'geist-ui-icons'
import { ProviderConnectionForm } from '../../../components/ProviderConnectionForm/ProviderConnectionForm'
import { data, Form, useSearchParams } from '@remix-run/react'
import {
  type ActionFunctionArgs,
  redirect,
  HeadersFunction,
} from '@remix-run/cloudflare'
import {
  canPerformPasswordLogin,
  getSessionExpirationDate,
  requireAnonymous,
} from '../../../server/auth/auth.server'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { useIsPending } from '../../../utils/misc'
import { checkHoneypot } from '../../../server/honeypot.server'
import { z } from 'zod'
import { EmailSchema } from '../../../utils/user-validation'
import { HoneypotInputs } from '../../../components/Honeypot/Honeypot'
import { redirectToKey, targetKey } from '../verify+'
import TextField from '@valley/ui/TextField'
import {
  getValidatedFormData,
  RemixFormProvider,
  useRemixForm,
} from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { prepareVerification } from '../verify+/verify.server'
import { sendAuthEmail } from 'app/server/email.server'
import { FieldErrors } from 'react-hook-form'
import { prisma } from 'app/server/db.server'
import { verifySessionStorage } from 'app/server/auth/verification.server'

const EmailFormSchema = z.intersection(
  z.object({
    email: EmailSchema,
    redirectTo: z.string().optional(),
  }),
  z.record(z.string(), z.string().optional())
)

type FormData = z.infer<typeof EmailFormSchema>

const resolver = zodResolver(EmailFormSchema)

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request)

  const {
    errors,
    data: submissionData,
    receivedValues,
  } = await getValidatedFormData<FormData>(request, resolver)

  checkHoneypot(receivedValues)

  if (errors) {
    return data(
      { errors },
      {
        status: 400,
      }
    )
  }

  const searchParams = new URLSearchParams({
    target: submissionData.email,
    ...(submissionData.redirectTo && { redirectTo: submissionData.redirectTo }),
  })
  const user = await prisma.user.findUnique({
    where: {
      email: submissionData.email,
    },
  })
  // Redirect to password login if no user to not to give any additional info to spambots
  if (!user) {
    return redirect('/auth/login/email?' + searchParams.toString())
  }

  const userHasPassword = await canPerformPasswordLogin(submissionData.email)
  if (userHasPassword) {
    return redirect('/auth/login/email?' + searchParams.toString())
  }

  const session = await prisma.session.create({
    select: { id: true, expirationDate: true, userId: true },
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    },
  })
  const verifySession = await verifySessionStorage.getSession()
  verifySession.set('unverifiedSessionId', session.id)

  const { verifyUrl, redirectTo, otp } = await prepareVerification({
    period: 10 * 60,
    request,
    type: 'auth',
    target: submissionData.email,
  })

  const response = await sendAuthEmail({
    code: otp,
    email: submissionData.email,
    magicLink: verifyUrl.toString(),
  })

  const headers = new Headers()
  headers.append(
    'set-cookie',
    await verifySessionStorage.commitSession(verifySession)
  )

  if (response.status === 'success') {
    return redirect(redirectTo.toString(), {
      headers,
    })
  } else {
    return data(
      {
        errors: {
          email: {
            type: 'value',
            message: response.error.message,
          },
        } satisfies FieldErrors<FormData>,
      },
      { status: 500 }
    )
  }
}

export const headers: HeadersFunction = ({ actionHeaders }) => {
  return actionHeaders
}

const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const isPending = useIsPending()
  const redirectTo = searchParams.get(redirectToKey)
  const target = searchParams.get(targetKey)

  const methods = useRemixForm<FormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    resolver,
    defaultValues: {
      redirectTo: redirectTo || undefined,
      email: target || undefined,
    },
    submitConfig: {
      viewTransition: true,
    },
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
        <RemixFormProvider {...methods}>
          <Stack asChild gap={2} fullWidth direction={'column'}>
            <Form onSubmit={methods.handleSubmit} viewTransition method="POST">
              <HoneypotInputs />
              {redirectTo && (
                <input
                  {...methods.register('redirectTo', {
                    value: redirectTo,
                  })}
                  type="hidden"
                />
              )}
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                hidden
              />
              <TextField
                {...methods.register('email')}
                // We want to focus the field when user clicks "email edit" button on the next page
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={!!target}
                fieldState={methods.getFieldState('email', methods.formState)}
                required
                size="lg"
                placeholder="Email"
                autoComplete="email"
                type="email"
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
            </Form>
          </Stack>
        </RemixFormProvider>
      </Stack>
    </main>
  )
}

export default LoginPage
