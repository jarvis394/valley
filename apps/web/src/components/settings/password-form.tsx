import { Button, Field, FormError, PasswordInput } from '@valley/ui'
import { Check } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { authClient } from '../../lib/auth'

const ERRORS: Record<string, string> = {
  INVALID_PASSWORD: 'Your current password is incorrect.',
  PASSWORD_TOO_SHORT: 'New password must be at least 8 characters.',
  PASSWORD_TOO_LONG: 'New password is too long.',
}

export function PasswordForm() {
  const [error, setError] = useState<string | undefined>(undefined)
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const currentPassword = String(form.get('currentPassword'))
    const newPassword = String(form.get('newPassword'))
    const confirm = String(form.get('confirm'))

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')

      return
    }
    if (newPassword !== confirm) {
      setError('New passwords do not match.')

      return
    }

    setPending(true)
    setError(undefined)
    setSaved(false)

    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
    setPending(false)

    if (result.error) {
      setError(
        (result.error.code && ERRORS[result.error.code]) ||
          result.error.message ||
          'Could not update your password.',
      )

      return
    }

    formElement.reset()
    setSaved(true)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Field variant="form" label="Current password">
        <PasswordInput
          name="currentPassword"
          required
          autoComplete="current-password"
          onChange={() => {
            setError(undefined)
            setSaved(false)
          }}
        />
      </Field>
      <Field variant="form" label="New password">
        <PasswordInput
          name="newPassword"
          required
          minLength={8}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          onChange={() => {
            setError(undefined)
            setSaved(false)
          }}
        />
      </Field>
      <Field variant="form" label="Confirm new password">
        <PasswordInput
          name="confirm"
          required
          minLength={8}
          autoComplete="new-password"
          onChange={() => {
            setError(undefined)
            setSaved(false)
          }}
        />
      </Field>
      <FormError message={error} gap={3} />
      {saved && (
        <p role="status" className="flex items-center gap-1.5 text-small text-emerald-300">
          <Check className="size-4" />
          Password updated.
        </p>
      )}
      <div>
        <Button type="submit" variant="secondary" size="md" loading={pending}>
          Update password
        </Button>
      </div>
    </form>
  )
}
