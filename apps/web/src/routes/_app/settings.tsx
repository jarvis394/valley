import { Collapsible } from '@base-ui/react/collapsible'
import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon, Avatar, Button, Card, CardRow, ScrollArea } from '@valley/ui'
import { useState } from 'react'
import { z } from 'zod'
import { DeleteAccountDialog } from '../../components/settings/delete-account-dialog'
import { EmailForm } from '../../components/settings/email-form'
import { PasswordForm } from '../../components/settings/password-form'
import { ProfileSection } from '../../components/settings/profile-section'
import { getProfileSettings } from '../../data/backend'
import { authClient, describeAuthError } from '../../lib/auth'

const searchSchema = z.object({
  error: z.string().optional(),
  email: z.literal('confirmed').optional(),
})

export const Route = createFileRoute('/_app/settings')({
  head: () => ({ meta: [{ title: 'Settings · Valley' }] }),
  validateSearch: searchSchema,
  loader: () => getProfileSettings(),
  component: SettingsPage,
})

function SettingsPage() {
  const profile = Route.useLoaderData()
  const { error, email: emailStatus } = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const [editingEmail, setEditingEmail] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const signOut = () => {
    setSigningOut(true)
    void authClient
      .signOut()
      .then(() => router.invalidate())
      .then(() => navigate({ to: '/login' }))
      .finally(() => setSigningOut(false))
  }

  return (
    <ScrollArea render={<main />} scrollbar="plain" className="h-full min-w-0 flex-1">
      <div className="mx-auto flex max-w-220 flex-col gap-8 px-4 py-8 lg:px-8 lg:py-12">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeftIcon />}
              className="lg:hidden"
              render={<Link to="/projects" />}
            >
              Projects
            </Button>
            <h1 className="font-display text-display font-medium tracking-tight text-fg">
              Settings
            </h1>
          </div>
          {profile.isAdmin && (
            <Button variant="secondary" size="sm" render={<Link to="/admin/users" />}>
              Manage users
            </Button>
          )}
        </div>

        <ProfileSection profile={profile} />

        <section className="flex flex-col gap-3">
          <h2 className="text-title font-medium text-fg">Account</h2>
          {emailStatus === 'confirmed' && (
            <p
              role="status"
              className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-small text-emerald-300"
            >
              Email confirmed. You can sign in with it now.
            </p>
          )}
          {error && (
            <p className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-2.5 text-small text-danger select-text">
              {describeAuthError(error)}
            </p>
          )}
          <Card divided>
            <CardRow
              leading={<Avatar src={profile.avatar} name={profile.name} size="md" />}
              label={profile.name}
              description={profile.email}
            >
              <Button variant="danger" size="sm" loading={signingOut} onClick={signOut}>
                Sign out
              </Button>
            </CardRow>

            <Collapsible.Root open={editingEmail} onOpenChange={setEditingEmail}>
              <CardRow
                label="Email"
                description={
                  profile.hasPassword
                    ? 'Where sign-in and recovery links are sent'
                    : 'Add an email and password to sign in directly'
                }
              >
                <Collapsible.Trigger render={<Button size="sm" variant="secondary" />}>
                  {editingEmail ? 'Cancel' : profile.hasPassword ? 'Change' : 'Add email'}
                </Collapsible.Trigger>
              </CardRow>
              <Collapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
                <div className="px-4 pb-4">
                  <EmailForm adding={!profile.hasPassword} />
                </div>
              </Collapsible.Panel>
            </Collapsible.Root>

            {profile.hasPassword && (
              <Collapsible.Root open={editingPassword} onOpenChange={setEditingPassword}>
                <CardRow
                  label="Password"
                  description="Choose a new password and sign out other devices"
                >
                  <Collapsible.Trigger render={<Button size="sm" variant="secondary" />}>
                    {editingPassword ? 'Cancel' : 'Change'}
                  </Collapsible.Trigger>
                </CardRow>
                <Collapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
                  <div className="px-4 pb-4">
                    <PasswordForm />
                  </div>
                </Collapsible.Panel>
              </Collapsible.Root>
            )}

            <CardRow
              label="Delete account"
              description="Removes your account, projects, and files. This cannot be undone."
            >
              <DeleteAccountDialog />
            </CardRow>
          </Card>
        </section>
      </div>
    </ScrollArea>
  )
}
