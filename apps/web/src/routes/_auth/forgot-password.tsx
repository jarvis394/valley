import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Button, Field, LinkButton, TextInput } from '@valley/ui'
import { MailCheck } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { AuthCard } from '../../components/auth/auth-card'
import { AuthColumn } from '../../components/auth/auth-column'
import { getSessionState } from '../../data/backend'
import { authClient } from '../../lib/auth'

export const Route = createFileRoute('/_auth/forgot-password')({
  head: () => ({ meta: [{ title: 'Reset password · Valley' }] }),
  beforeLoad: async () => {
    const state = await getSessionState()
    if (state.status === 'active') throw redirect({ to: '/projects' })
    if (state.status === 'pending') throw redirect({ to: '/pending' })
  },
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | undefined>(undefined)
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email'))
    setPending(true)
    setError(undefined)

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setPending(false)

    if (result.error) {
      setError(result.error.message || 'Could not send reset email. Try again.')

      return
    }

    setSentTo(email)
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
        <h1 className="text-display font-medium tracking-tight text-fg">Forgot password</h1>
        <p className="text-body text-fg/63">Enter your email and we will send you a reset link</p>
      </div>
      <AuthCard>
        {sentTo ? (
          <div role="status" className="flex flex-col gap-3 select-text">
            <p className="flex items-center gap-2 text-body font-medium text-fg">
              <MailCheck className="size-4 shrink-0 text-fg/63" />
              Check your inbox
            </p>
            <p className="text-body text-fg/63">
              If an account exists for <span className="text-fg">{sentTo}</span>, we sent a link to
              reset your password.
            </p>
            <div className="pt-1">
              <LinkButton onClick={() => setSentTo(null)}>Send another link</LinkButton>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Field variant="form" label="Email" error={error}>
              <TextInput
                name="email"
                type="email"
                size="lg"
                placeholder="you@example.com"
                required
                autoComplete="email"
                onChange={() => setError(undefined)}
              />
            </Field>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-1 w-full"
              loading={pending}
            >
              Send reset link
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthColumn>
  )
}
