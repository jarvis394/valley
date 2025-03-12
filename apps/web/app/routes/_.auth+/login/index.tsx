import React from 'react'
import styles from '../auth.module.css'
import Button from '@valley/ui/Button'
import { PROVIDER_NAMES } from 'app/config/connections'
import Divider from '@valley/ui/Divider'
import Stack from '@valley/ui/Stack'
import { ArrowRight } from 'geist-ui-icons'
import { ProviderConnectionForm } from 'app/components/ProviderConnectionForm/ProviderConnectionForm'
import { data, Form, useSearchParams } from '@remix-run/react'
import {
  type ActionFunctionArgs,
  redirect,
  HeadersFunction,
} from '@remix-run/node'
import { requireAnonymous } from 'app/server/auth/auth.server'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { useIsPending } from 'app/utils/misc'
import { checkHoneypot } from 'app/server/honeypot.server'
import { z } from 'zod'
import { EmailSchema } from 'app/utils/user-validation'
import { HoneypotInputs } from 'app/components/Honeypot/Honeypot'
import { redirectToKey, targetKey, typeKey } from 'app/config/paramsKeys'
import TextField from '@valley/ui/TextField'
import {
  getValidatedFormData,
  RemixFormProvider,
  useRemixForm,
} from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldErrors } from 'react-hook-form'
import { useHydrated } from 'remix-utils/use-hydrated'
import { db } from '@valley/db'
import { auth } from '@valley/auth'
import { VerificationType } from '../verify+'

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

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, submissionData.email),
    with: {
      accounts: {
        columns: { password: true },
      },
    },
  })

  // Redirect to password login if no user to not to give any additional info to spambots
  if (!user) {
    return redirect('/auth/login/email?' + searchParams.toString())
  }

  // Redirect to password login if user has password
  if (user.accounts.find((e) => e.password)) {
    return redirect('/auth/login/email?' + searchParams.toString())
  }

  // Send OTP code for sign-in and redirect to /auth/verify on success
  const response = await auth.api.sendVerificationOTP({
    body: {
      email: submissionData.email,
      type: 'sign-in',
    },
  })

  if (response.success) {
    searchParams.set(typeKey, 'auth' satisfies VerificationType)
    return redirect('/auth/verify?' + searchParams.toString())
  } else {
    return data(
      {
        errors: {
          email: {
            type: 'value',
            message: 'Could not send the OTP code, try again',
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
  const isHydrated = useHydrated()

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
              type="Login"
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
                disabled={isPending || !isHydrated}
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
