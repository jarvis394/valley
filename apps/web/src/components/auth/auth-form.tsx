import { Link } from '@tanstack/react-router'
import type { SignupMode } from '@valley/backend'
import { Button, Field, FormError, LinkButton, PasswordInput, TextInput } from '@valley/ui'
import { MailCheck } from 'lucide-react'
import { type CSSProperties, type FormEvent, useState } from 'react'
import { authClient } from '../../lib/auth'
import { AuthCard } from './auth-card'

export type AuthMode = 'sign-in' | 'sign-up'

type FieldName = 'name' | 'email' | 'password'
type Errors = Partial<Record<FieldName | 'form', string>>

const AUTH_ERRORS: Record<string, [FieldName | 'form', string]> = {
  INVALID_EMAIL: ['email', "That doesn't look like an email address"],
  USER_ALREADY_EXISTS: ['email', 'An account with this email already exists. Sign in instead'],
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: [
    'email',
    'An account with this email already exists. Sign in instead',
  ],
  INVALID_EMAIL_OR_PASSWORD: ['form', 'Wrong email or password'],
  EMAIL_NOT_VERIFIED: ['form', 'Confirm your email first. We sent a new link to it'],
  PASSWORD_TOO_SHORT: ['password', 'Use at least 8 characters'],
  PASSWORD_TOO_LONG: ['password', 'That password is too long'],
}

const FIELD_PROBLEM: Record<FieldName, string> = {
  name: 'Enter a name, up to 64 characters',
  email: "That doesn't look like an email address",
  password: 'Use at least 8 characters',
}

function describeError(error: { code?: string; message?: string }): Errors {
  const known = error.code ? AUTH_ERRORS[error.code] : undefined
  if (known) return { [known[0]]: known[1] }

  const match = error.message?.match(/^\[body\.(\w+)\]/)
  const field = match?.[1] as FieldName | undefined
  if (field && field in FIELD_PROBLEM) return { [field]: FIELD_PROBLEM[field] }

  return { form: error.message || 'Could not reach Valley. Check your connection and try again.' }
}

/** Parts with matching view-transition names slide smoothly across /login <-> /signup. */
export const part = (name: string) =>
  ({ viewTransitionName: `auth-${name}`, viewTransitionClass: 'auth' }) as CSSProperties

export function authCopy(mode: AuthMode, signupMode: SignupMode) {
  if (mode === 'sign-in') {
    return {
      title: 'Sign in',
      subtitle: 'Your galleries and editor workspace',
      switch: 'I do not have an account',
    }
  }

  return {
    title: 'Create account',
    subtitle:
      signupMode === 'invite'
        ? 'Request access to this Valley instance'
        : 'Create your Valley account',
    switch: 'I already have an account',
  }
}

export function AuthForm({
  mode,
  signupMode,
  initialError,
  onSignedIn,
}: {
  mode: AuthMode
  signupMode: SignupMode
  initialError?: string | null
  onSignedIn: () => Promise<unknown>
}) {
  const [errors, setErrors] = useState<Errors>(() => (initialError ? { form: initialError } : {}))
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const clearError = (field: FieldName) => {
    if (errors[field]) setErrors((all) => ({ ...all, [field]: undefined }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    setPending(true)
    setErrors({})

    const callbackURL = '/login'
    const result =
      mode === 'sign-in'
        ? await authClient.signIn.email({ email, password, callbackURL })
        : await authClient.signUp.email({
            email,
            password,
            name: String(form.get('name')),
            callbackURL,
          })

    if (result.error) {
      setPending(false)
      setErrors(describeError(result.error))

      return
    }

    if (mode === 'sign-up') {
      setPending(false)
      setSentTo(email)

      return
    }

    await onSignedIn()
    setPending(false)
  }

  return (
    <AuthCard style={part('card')}>
      {sentTo ? (
        <div role="status" className="flex flex-col gap-3 select-text">
          <p className="flex items-center gap-2 text-body font-medium text-fg">
            <MailCheck className="size-4 shrink-0 text-fg/63" />
            Check your inbox
          </p>
          <p className="text-body text-fg/63">
            We sent a link to <span className="text-fg">{sentTo}</span>. Open it to confirm your
            email.{' '}
            {signupMode === 'invite'
              ? 'An admin then approves your account before you can open the editor.'
              : 'Once confirmed, you can jump straight into your workspace.'}
          </p>
          <p className="text-small text-fg/63">
            Did not get it? Sign in with the same email and password to get a new link.
          </p>
          <div className="pt-1">
            <LinkButton onClick={() => setSentTo(null)}>Use another email</LinkButton>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'sign-up' && (
            <Field variant="form" label="Name" style={part('name')} error={errors.name}>
              <TextInput
                name="name"
                size="lg"
                placeholder="Alex"
                required
                autoComplete="name"
                onChange={() => clearError('name')}
              />
            </Field>
          )}
          <Field variant="form" label="Email" style={part('email')} error={errors.email}>
            <TextInput
              name="email"
              type="email"
              size="lg"
              placeholder="you@example.com"
              required
              autoComplete="email"
              onChange={() => clearError('email')}
            />
          </Field>
          <Field
            variant="form"
            label="Password"
            style={part('password')}
            error={errors.password}
            labelEnd={
              mode === 'sign-in' ? (
                <Link
                  to="/forgot-password"
                  viewTransition
                  className="text-small text-fg/63 transition-colors hover:text-fg"
                >
                  Forgot password?
                </Link>
              ) : undefined
            }
          >
            <PasswordInput
              name="password"
              size="lg"
              placeholder={mode === 'sign-in' ? 'Enter your password' : 'At least 8 characters'}
              required
              minLength={8}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              onChange={() => {
                clearError('password')
                if (errors.form) setErrors((all) => ({ ...all, form: undefined }))
              }}
            />
          </Field>
          <FormError message={errors.form} gap={3} style={part('error')} />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-1 w-full"
            style={part('submit')}
            loading={pending}
          >
            {mode === 'sign-in'
              ? 'Sign in'
              : signupMode === 'invite'
                ? 'Request access'
                : 'Create account'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
