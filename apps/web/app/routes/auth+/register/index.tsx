import React from 'react'
import styles from '../auth.module.css'
import Button from '@valley/ui/Button'
import { Form, useSearchParams } from '@remix-run/react'
import {
  type ActionFunctionArgs,
  redirect,
  data,
  HeadersFunction,
} from '@remix-run/node'
import { prisma } from '../../../server/db.server'
import { EmailSchema } from '../../../utils/user-validation'
import { z } from 'zod'
import { prepareVerification } from '../verify/verify.server'
import { useIsPending } from '../../../utils/misc'
import { HoneypotInputs } from 'app/components/Honeypot/Honeypot'
import { sendRegisterEmail } from '../../../server/email.server'
import Divider from '@valley/ui/Divider'
import { ProviderConnectionForm } from 'app/components/ProviderConnectionForm/ProviderConnectionForm'
import { PROVIDER_NAMES } from 'app/config/connections'
import Stack from '@valley/ui/Stack'
import { SEOHandle } from '@nasa-gcn/remix-seo'
import { ArrowRight } from 'geist-ui-icons'
import { redirectToKey, targetKey } from '../verify'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkHoneypot } from 'app/server/honeypot.server'
import {
  getValidatedFormData,
  RemixFormProvider,
  useRemixForm,
} from 'remix-hook-form'
import { FieldErrors } from 'react-hook-form'
import TextField from '@valley/ui/TextField'

const SignupSchema = z.intersection(
  z.object({
    email: EmailSchema,
    redirectTo: z.string().optional(),
  }),
  z.record(z.string(), z.string().optional())
)

type FormData = z.infer<typeof SignupSchema>

const resolver = zodResolver(SignupSchema)

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export async function action({ request }: ActionFunctionArgs) {
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

  const existingUser = await prisma.user.findUnique({
    where: { email: submissionData.email },
    select: { id: true },
  })

  if (existingUser) {
    return data(
      {
        errors: {
          email: {
            type: 'value',
            message: 'A user already exists with this email',
          },
        } satisfies FieldErrors<FormData>,
      },
      {
        status: 401,
      }
    )
  }

  const { verifyUrl, redirectTo, otp } = await prepareVerification({
    period: 10 * 60,
    request,
    type: 'onboarding',
    target: submissionData.email,
    redirectTo: submissionData.redirectTo,
  })

  const response = await sendRegisterEmail({
    code: otp,
    email: submissionData.email,
    magicLink: verifyUrl.toString(),
  })

  if (response.status === 'success') {
    return redirect(redirectTo.toString())
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

const RegisterPage: React.FC = () => {
  const isPending = useIsPending()
  const [searchParams] = useSearchParams()
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
      <h1 className={styles.auth__contentHeader}>Create your Valley account</h1>
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
              redirectTo={redirectTo}
              type="Sign up"
            />
          ))}
        </Stack>
        <Divider style={{ viewTransitionName: 'auth-divider' }}>OR</Divider>
        <RemixFormProvider {...methods}>
          <Stack asChild gap={2} fullWidth direction={'column'}>
            <Form onSubmit={methods.handleSubmit} method="POST" viewTransition>
              <HoneypotInputs />
              {redirectTo && (
                <input
                  {...methods.register('redirectTo')}
                  type="hidden"
                  value={redirectTo}
                />
              )}
              <TextField
                {...methods.register('email')}
                // We want to focus the field when user clicks "email edit" button on the next page
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={!!target}
                fieldState={methods.getFieldState('email', methods.formState)}
                required
                size="lg"
                placeholder="Email"
                formHelperTextProps={{
                  style: {
                    paddingBottom: 4,
                  },
                }}
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
                Sign up with Email
              </Button>
            </Form>
          </Stack>
        </RemixFormProvider>
      </Stack>
    </main>
  )
}

export default RegisterPage
