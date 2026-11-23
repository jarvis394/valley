import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button, Dialog, Field, FormError, TextInput } from '@valley/ui'
import { type FormEvent, useState } from 'react'
import { authClient } from '../../lib/auth'

const CONFIRMATION = 'i am sure'

export function DeleteAccountDialog() {
  const navigate = useNavigate()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const changeOpen = (next: boolean) => {
    if (pending) return
    setOpen(next)
    if (!next) {
      setConfirmed(false)
      setError(undefined)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!confirmed) return

    setPending(true)
    setError(undefined)

    const result = await authClient.deleteUser({})
    if (result.error) {
      setPending(false)
      setError(
        result.error.code === 'SESSION_EXPIRED'
          ? 'For your safety, sign out and sign back in, then delete your account within a day.'
          : result.error.message || 'Could not delete your account. Try again.',
      )

      return
    }

    setOpen(false)
    await router.invalidate()
    await navigate({ to: '/login' })
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger render={<Button size="sm" variant="danger" />}>Delete</Dialog.Trigger>
      <Dialog.Popup
        title="Delete your account?"
        description="Your account, projects, and uploaded files are permanently deleted. This cannot be undone."
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field
            variant="form"
            label={
              <>
                Type{' '}
                <span className="mx-0.5 rounded bg-danger/12 px-1.5 py-0.5 text-danger">
                  {CONFIRMATION}
                </span>{' '}
                to confirm
              </>
            }
          >
            <TextInput
              name="confirmation"
              required
              pattern={CONFIRMATION}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setConfirmed(event.currentTarget.value === CONFIRMATION)}
            />
          </Field>
          <FormError message={error} gap={4} />
          <Dialog.Actions>
            <Dialog.Close render={<Button variant="secondary" size="md" disabled={pending} />}>
              Cancel
            </Dialog.Close>
            <Button
              type="submit"
              variant="danger"
              size="md"
              disabled={!confirmed}
              loading={pending}
            >
              Delete account
            </Button>
          </Dialog.Actions>
        </form>
      </Dialog.Popup>
    </Dialog.Root>
  )
}
