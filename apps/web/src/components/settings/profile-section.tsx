import { useRouter } from '@tanstack/react-router'
import { Avatar, Button, Card, CardRow, FileInput, TextInput } from '@valley/ui'
import { Check } from 'lucide-react'
import { type FormEvent, useRef, useState } from 'react'
import { updateProfileName } from '../../data/backend'
import type { ProfileSettings } from '../../data/types'

async function uploadAvatarFile(file: File): Promise<{ error?: string }> {
  const form = new FormData()
  form.set('file', file)

  const response = await fetch('/api/account/avatar', { method: 'PUT', body: form }).catch(
    () => null,
  )
  if (!response) return { error: 'Could not reach Valley. Check your connection.' }
  if (response.ok) return {}

  const body = (await response.json().catch(() => null)) as { error?: string } | null

  return { error: body?.error ?? 'Could not upload avatar image.' }
}

async function deleteAvatarFile(): Promise<{ error?: string }> {
  const response = await fetch('/api/account/avatar', { method: 'DELETE' }).catch(() => null)
  if (!response) return { error: 'Could not reach Valley. Check your connection.' }
  if (response.ok) return {}

  const body = (await response.json().catch(() => null)) as { error?: string } | null

  return { error: body?.error ?? 'Could not remove avatar image.' }
}

export function ProfileSection({ profile }: { profile: ProfileSettings }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarPending, setAvatarPending] = useState(false)
  const [avatarError, setAvatarError] = useState<string | undefined>(undefined)

  const uploadAvatar = async (files: File[]) => {
    const file = files[0]
    if (!file) return

    setAvatarPending(true)
    setAvatarError(undefined)
    const result = await uploadAvatarFile(file)
    setAvatarPending(false)

    if (result.error) {
      setAvatarError(result.error)

      return
    }
    await router.invalidate()
  }

  const removeAvatar = async () => {
    setAvatarPending(true)
    setAvatarError(undefined)
    const result = await deleteAvatarFile()
    setAvatarPending(false)

    if (result.error) {
      setAvatarError(result.error)

      return
    }
    await router.invalidate()
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title font-medium text-fg">Profile</h2>
      <Card divided>
        <CardRow
          leading={<Avatar src={profile.avatar} name={profile.name} size="lg" />}
          label="Profile picture"
          description="Shown in the sidebar and on your public gallery"
          error={avatarError}
        >
          <FileInput
            ref={fileRef}
            accept="image/jpeg,image/png,image/webp,image/avif"
            onFiles={(files) => void uploadAvatar(files)}
          />
          <Button
            variant="secondary"
            size="sm"
            loading={avatarPending}
            onClick={() => fileRef.current?.click()}
          >
            {profile.hasUploadedAvatar ? 'Change' : 'Upload'}
          </Button>
          {profile.hasUploadedAvatar && (
            <Button
              variant="ghost"
              size="sm"
              disabled={avatarPending}
              onClick={() => void removeAvatar()}
            >
              Remove
            </Button>
          )}
        </CardRow>
        <NameRow key={profile.name} current={profile.name} />
      </Card>
    </section>
  )
}

function NameRow({ current }: { current: string }) {
  const router = useRouter()
  const [name, setName] = useState(current)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const trimmed = name.trim()
  const dirty = trimmed !== current && trimmed.length > 0

  const save = (event: FormEvent) => {
    event.preventDefault()
    if (!trimmed) {
      setError('Enter a name')

      return
    }
    if (!dirty) return

    setPending(true)
    setError(undefined)
    void updateProfileName({ data: trimmed })
      .then(() => router.invalidate())
      .catch(() => setError('Could not save your name'))
      .finally(() => setPending(false))
  }

  return (
    <CardRow
      label="Display name"
      description="Shown across Valley and on new projects"
      error={error}
    >
      <form onSubmit={save} className="flex shrink-0 items-center gap-2">
        <TextInput
          aria-label="Display name"
          value={name}
          maxLength={64}
          invalid={Boolean(error)}
          className="w-52"
          onChange={(event) => {
            setName(event.currentTarget.value)
            setError(undefined)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setName(current)
              setError(undefined)
            }
          }}
        />
        <Button
          type="submit"
          variant="secondary"
          size="md"
          disabled={!dirty}
          loading={pending}
          icon={<Check className="size-4" />}
        >
          Save
        </Button>
      </form>
    </CardRow>
  )
}
