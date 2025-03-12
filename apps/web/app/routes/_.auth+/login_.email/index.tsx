import React from 'react'
import styles from '../auth.module.css'
import { SEOHandle } from '@nasa-gcn/remix-seo'
import { type ActionFunctionArgs } from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import { requireAnonymous } from 'app/server/auth/auth.server'
import Button from '@valley/ui/Button'
import { ArrowLeft } from 'geist-ui-icons'
import { PasswordSchema, EmailSchema } from 'app/utils/user-validation'
import { z } from 'zod'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { combineHeaders, useIsPending } from 'app/utils/misc'
import AuthFormHeader from 'app/components/AuthFormHeader/AuthFormHeader'
import PasswordField from 'app/components/PasswordField/PasswordField'
import { redirectToKey, targetKey } from 'app/config/paramsKeys'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  getValidatedFormData,
  RemixFormProvider,
  useRemixForm,
} from 'remix-hook-form'
import { FieldErrors } from 'react-hook-form'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import Stack from '@valley/ui/Stack'
import { createToastHeaders } from 'app/server/toast.server'
import { auth } from '@valley/auth'
import { redirect } from '@remix-run/router'

const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  redirectTo: z.string().optional(),
})

type FormData = z.infer<typeof LoginFormSchema>

const resolver = zodResolver(LoginFormSchema)

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request)

  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver)
  if (errors) {
    return { errors, defaultValues }
  }

  try {
    const response = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
      returnHeaders: true,
    })

    const toastHeaders = await createToastHeaders({
      type: 'info',
      description: 'You are now logged in',
    })
    const redirectTo = safeRedirect(data.redirectTo, '/projects')

    return redirect(redirectTo, {
      headers: combineHeaders(toastHeaders, response.headers),
    })
  } catch (e) {
    return {
      errors: {
        password: {
          type: 'validate',
          message: 'Invalid email or password',
        },
      } satisfies FieldErrors<FormData>,
      defaultValues: data,
    }
  }
}

const LoginViaEmailPage: React.FC = () => {
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  const isPending = useIsPending()
  const redirectTo = searchParams.get(redirectToKey)
  const target = searchParams.get(targetKey)
  const methods = useRemixForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver,
    defaultValues: actionData?.defaultValues || {
      email: target || undefined,
      redirectTo: redirectTo || undefined,
    },
    errors: actionData?.errors as FieldErrors<FormData>,
  })

  return (
    <main className={styles.auth__content}>
      <AuthFormHeader type="password" email={target} />
      <RemixFormProvider {...methods}>
        <Stack asChild gap={2} align={'center'} fullWidth direction={'column'}>
          <Form
            onSubmit={methods.handleSubmit}
            method="POST"
            style={{ viewTransitionName: 'auth-form' }}
          >
            <HoneypotInputs />
            {redirectTo && <input {...methods.register('redirectTo')} hidden />}
            {target && (
              <input
                {...methods.register('email')}
                autoComplete="email"
                type="email"
                hidden
              />
            )}
            <PasswordField
              {...methods.register('password')}
              // This should be always auto focused, as we are transitioning within the same form
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              required
              fieldState={methods.getFieldState('password', methods.formState)}
              size="lg"
              placeholder="Password"
              autoComplete="current-password"
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
              style={{ viewTransitionName: 'auth-form-submit' }}
            >
              Continue
            </Button>
            <Button
              asChild
              variant="tertiary-dimmed"
              before={<ArrowLeft />}
              size="md"
            >
              <Link to="/auth/login" viewTransition>
                Other Login options
              </Link>
            </Button>
          </Form>
        </Stack>
      </RemixFormProvider>
    </main>
  )
}

export default LoginViaEmailPage
