import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button, Field, FormError, PasswordInput } from '@valley/ui'
import { type FormEvent, useState } from 'react'
import { z } from 'zod'
import { AuthCard } from '../../components/auth/auth-card'
import { AuthColumn } from '../../components/auth/auth-column'
import { authClient } from '../../lib/auth'

const searchSchema = z.object({
  token: z.string().optional(),
  error: z.string().optional(),
})

export const Route = createFileRoute('/_auth/reset-password')({
  head: () => ({ meta: [{ title: 'Choose a new password · Valley' }] }),
  validateSearch: searchSchema,
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token, error: tokenError } = Route.useSearch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | undefined>(undefined)
  const [pending, setPending] = useState(false)

  const invalidLink = !token || Boolean(tokenError)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return

    const form = new FormData(event.currentTarget)
    const password = String(form.get('password'))
    const confirm = String(form.get('confirm'))

    if (password.length < 8) {
      setError('Use at least 8 characters')

      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')

      return
    }

    setPending(true)
    setError(undefined)

    const result = await authClient.resetPassword({ newPassword: password, token })
    if (result.error) {
      setPending(false)
      const code = result.error.code
      setError(
        code === 'INVALID_TOKEN' || code === 'TOKEN_EXPIRED'
          ? 'This reset link has expired or was already used.'
          : result.error.message || 'Could not reset your password. Try again.',
      )

      return
    }

    await navigate({ to: '/login', search: { reset: 'done' }, viewTransition: true })
  }

  return (
    <AuthColumn
      footer={
        <Button variant="ghost" render={<Link to="/login" viewTransition />}>
          Back to sign in
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-display font-medium tracking-tight text-fg">New password</h1>
        <p className="text-body text-fg/63">
          {invalidLink ? 'That reset link is no longer valid' : 'Choose a new password for Valley'}
        </p>
      </div>
      <AuthCard>
        {invalidLink ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-fg/63">
              This password reset link is invalid or has expired. Request a new link to continue.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              render={<Link to="/forgot-password" viewTransition />}
            >
              Request a new link
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Field variant="form" label="New password">
              <PasswordInput
                name="password"
                size="lg"
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                onChange={() => setError(undefined)}
              />
            </Field>
            <Field variant="form" label="Confirm password">
              <PasswordInput
                name="confirm"
                size="lg"
                placeholder="Repeat your new password"
                required
                minLength={8}
                autoComplete="new-password"
                onChange={() => setError(undefined)}
              />
            </Field>
            <FormError message={error} gap={3} />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-1 w-full"
              loading={pending}
            >
              Update password
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthColumn>
  )
}
