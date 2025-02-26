import React from 'react'
import styles from '../auth.module.css'
import { SEOHandle } from '@nasa-gcn/remix-seo'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import { login, requireAnonymous } from '../../../server/auth/auth.server'
import Button from '@valley/ui/Button'
import { ArrowLeft } from 'geist-ui-icons'
import { PasswordSchema, EmailSchema } from '../../../utils/user-validation'
import { z } from 'zod'
import { handleNewSession } from '../login/login.server'
import { useIsPending } from '../../../utils/misc'
import AuthFormHeader from '../../../components/AuthFormHeader/AuthFormHeader'
import { redirectToKey, targetKey } from '../verify+'
import PasswordField from '../../../components/PasswordField/PasswordField'
import { zodResolver } from '@hookform/resolvers/zod'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { FieldErrors } from 'react-hook-form'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import Stack from '@valley/ui/Stack'
import { createToastHeaders } from 'app/server/toast.server'

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

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return {}
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

  const session = await login(data)
  if (!session) {
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

  return handleNewSession(
    {
      request,
      session,
      redirectTo: data.redirectTo,
    },
    {
      headers: await createToastHeaders({
        type: 'info',
        description: 'You are now logged in',
      }),
    }
  )
}

const LoginViaEmailPage: React.FC = () => {
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  const isPending = useIsPending()
  const redirectTo = searchParams.get(redirectToKey)
  const target = searchParams.get(targetKey)
  const { handleSubmit, getFieldState, formState, register } =
    useRemixForm<FormData>({
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
      <Stack asChild gap={2} align={'center'} fullWidth direction={'column'}>
        <Form
          onSubmit={handleSubmit}
          method="POST"
          style={{ viewTransitionName: 'auth-form' }}
        >
          <HoneypotInputs />
          {redirectTo && <input {...register('redirectTo')} hidden />}
          {target && (
            <input
              {...register('email')}
              autoComplete="email"
              type="email"
              hidden
            />
          )}
          <PasswordField
            {...register('password')}
            // This should be always auto focused, as we are transitioning within the same form
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            required
            fieldState={getFieldState('password', formState)}
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
    </main>
  )
}

export default LoginViaEmailPage
