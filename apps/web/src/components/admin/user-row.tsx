import { useRouter } from '@tanstack/react-router'
import {
  AlertDialog,
  Avatar,
  Badge,
  Button,
  CardRow,
  FormError,
  IconButton,
  Menu,
  MoreIcon,
} from '@valley/ui'
import { ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { approveUser, deleteAdminUser, setUserRole } from '../../data/backend'
import type { AdminUser } from '../../data/types'

type ConfirmedAction = 'decline' | 'promote' | 'demote' | 'delete'

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })

function confirmationCopy(action: ConfirmedAction, user: AdminUser) {
  switch (action) {
    case 'decline':
      return {
        title: `Decline ${user.name}?`,
        description: 'Their sign-up is deleted. They can ask again by signing up once more.',
        confirmLabel: 'Decline',
        danger: true,
      }
    case 'promote':
      return {
        title: `Make ${user.name} an admin?`,
        description: 'Admins can approve sign-ups, manage roles, and remove other user accounts.',
        confirmLabel: 'Make admin',
        danger: false,
      }
    case 'demote':
      return {
        title: `Remove admin role from ${user.name}?`,
        description: 'They keep their projects and account, but lose access to user management.',
        confirmLabel: 'Remove admin',
        danger: false,
      }
    case 'delete':
      return {
        title: `Delete ${user.name}'s account?`,
        description:
          'Their account, projects, and uploaded files are deleted permanently. This cannot be undone.',
        confirmLabel: 'Delete account',
        danger: true,
      }
  }
}

export function UserRow({ user, isMe }: { user: AdminUser; isMe: boolean }) {
  const router = useRouter()
  const [asking, setAsking] = useState(false)
  const [shown, setShown] = useState<ConfirmedAction>('delete')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const isAdmin = user.role === 'admin'
  const dialog = confirmationCopy(shown, user)
  const joined = dateFormatter.format(new Date(user.createdAt))
  const holdings = `${user.projects} ${user.projects === 1 ? 'project' : 'projects'} · ${user.assets} ${user.assets === 1 ? 'file' : 'files'}`

  const ask = (next: ConfirmedAction) => {
    setError(undefined)
    setShown(next)
    setAsking(true)
  }

  const runApprove = () => {
    setBusy(true)
    setError(undefined)
    void approveUser({ data: user.id })
      .then(() => router.invalidate())
      .catch(() => setError('Could not approve this user. Try again.'))
      .finally(() => setBusy(false))
  }

  const runConfirmed = () => {
    setBusy(true)
    setError(undefined)

    const request =
      shown === 'promote'
        ? setUserRole({ data: { id: user.id, role: 'admin' } })
        : shown === 'demote'
          ? setUserRole({ data: { id: user.id, role: 'user' } })
          : deleteAdminUser({ data: user.id })

    void request
      .then(async () => {
        setAsking(false)
        await router.invalidate()
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Action failed. Try again.')
      })
      .finally(() => setBusy(false))
  }

  return (
    <CardRow
      leading={<Avatar src={user.avatar} name={user.name} size="md" />}
      label={
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate">{user.name}</span>
          {isAdmin && <Badge variant="info">Admin</Badge>}
          {!user.emailVerified && <Badge variant="warning">Email unconfirmed</Badge>}
          {isMe && <span className="text-label font-normal text-fg/50">you</span>}
        </span>
      }
      description={
        <>
          <p className="truncate select-text">
            {user.email} · {user.pending ? 'requested' : 'joined'} {joined}
          </p>
          {!user.pending && <p className="truncate text-fg/50 tabular-nums">{holdings}</p>}
        </>
      }
      error={asking ? undefined : error}
    >
      {user.pending ? (
        <>
          <Button variant="danger" size="sm" disabled={busy} onClick={() => ask('decline')}>
            Decline
          </Button>
          <Button variant="primary" size="sm" loading={busy} onClick={runApprove}>
            Approve
          </Button>
        </>
      ) : (
        !isMe && (
          <Menu.Root>
            <Menu.Trigger
              render={
                <IconButton
                  variant="outline"
                  size="sm"
                  aria-label={`Manage ${user.name}`}
                  disabled={busy}
                />
              }
            >
              <MoreIcon />
            </Menu.Trigger>
            <Menu.Popup align="end">
              <Menu.Label title={user.name} description={user.email} />
              <Menu.Separator />
              <Menu.Item
                icon={
                  isAdmin ? <ShieldOff className="size-4" /> : <ShieldCheck className="size-4" />
                }
                onClick={() => ask(isAdmin ? 'demote' : 'promote')}
              >
                {isAdmin ? 'Remove admin' : 'Make admin'}
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item
                variant="danger"
                icon={<Trash2 className="size-4" />}
                onClick={() => ask('delete')}
              >
                Delete account
              </Menu.Item>
            </Menu.Popup>
          </Menu.Root>
        )
      )}

      <AlertDialog.Root
        open={asking}
        onOpenChange={(next) => {
          if (!busy) setAsking(next)
        }}
      >
        <AlertDialog.Popup title={dialog.title} description={dialog.description}>
          <FormError message={error} gap={5} />
          <AlertDialog.Actions>
            <AlertDialog.Close render={<Button variant="secondary" size="md" disabled={busy} />}>
              Cancel
            </AlertDialog.Close>
            <Button
              variant={dialog.danger ? 'danger' : 'primary'}
              size="md"
              loading={busy}
              onClick={runConfirmed}
            >
              {dialog.confirmLabel}
            </Button>
          </AlertDialog.Actions>
        </AlertDialog.Popup>
      </AlertDialog.Root>
    </CardRow>
  )
}
