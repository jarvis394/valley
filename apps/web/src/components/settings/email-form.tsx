import { Button, Field, FormError, LinkButton, PasswordInput, TextInput } from '@valley/ui'
import { MailCheck } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { authClient } from '../../lib/auth'

const ERRORS: Record<string, string> = {
  email_unchanged: 'That is already your email address.',
  email_in_use: 'Another Valley account already uses this email.',
  password_required: 'Choose a password to sign in with.',
  password_too_short: 'Use at least 8 characters.',
  password_too_long: 'That password is too long.',
  email_send_failed: 'Could not send the confirmation email. Try again in a minute.',
}

async function sendEmailChange(body: { email: string; password?: string }) {
  const { data, error } = await authClient.$fetch<{ email: string }>('/email/change', {
    method: 'POST',
    body,
  })
  if (!error && data) return { email: data.email }

  const key = error?.message ?? ''
  const message =
    ERRORS[key] ??
    (error?.status === 429 ? 'Too many attempts. Wait a minute.' : error?.message) ??
    'Could not reach Valley. Check your connection and try again.'

  return { error: message }
}

export function EmailForm({ adding }: { adding: boolean }) {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | undefined>(undefined)
  const [pending, setPending] = useState(false)

  if (sentTo) {
    return (
      <div className="flex gap-3 rounded-xl border-[0.5px] border-white/7 bg-canvas/60 p-4">
        <MailCheck className="mt-0.5 size-4 shrink-0 text-accent" />
        <div className="flex flex-col gap-1 text-body">
          <p className="text-fg">
            Check <span className="font-medium">{sentTo}</span> for a link from us.
          </p>
          <p className="text-fg/63">
            Open it within an hour to {adding ? 'add' : 'switch to'} this email.{' '}
            <LinkButton onClick={() => setSentTo(null)}>Use another address</LinkButton>
          </p>
        </div>
      </div>
    )
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(undefined)

    const result = await sendEmailChange({
      email: String(form.get('email')),
      password: adding ? String(form.get('password')) : undefined,
    })
    setPending(false)

    if ('error' in result) {
      setError(result.error)

      return
    }
    setSentTo(result.email)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Field variant="form" label={adding ? 'Address' : 'New address'}>
        <TextInput
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          onChange={() => setError(undefined)}
        />
      </Field>
      {adding && (
        <Field
          variant="form"
          label="Password"
          description="At least 8 characters. You will sign in with this email and password."
        >
          <PasswordInput
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            onChange={() => setError(undefined)}
          />
        </Field>
      )}
      <FormError message={error} gap={3} />
      <div>
        <Button type="submit" variant="secondary" size="md" loading={pending}>
          Send confirmation link
        </Button>
      </div>
    </form>
  )
}
