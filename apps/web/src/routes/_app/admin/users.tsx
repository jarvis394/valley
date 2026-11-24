import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { ArrowLeftIcon, Badge, Button, Card, ScrollArea } from '@valley/ui'
import { UserRow } from '../../../components/admin/user-row'
import { getAuthConfig, listAdminUsers } from '../../../data/backend'

export const Route = createFileRoute('/_app/admin/users')({
  head: () => ({ meta: [{ title: 'Users · Admin · Valley' }] }),
  beforeLoad: ({ context }) => {
    if (!context.session.isAdmin) throw redirect({ to: '/projects' })
  },
  loader: async () => {
    const [users, config] = await Promise.all([listAdminUsers(), getAuthConfig()])

    return { users, signupMode: config.signupMode }
  },
  component: UsersPage,
})

function UsersPage() {
  const { users, signupMode } = Route.useLoaderData()
  const { session } = Route.useRouteContext()
  const waiting = users.filter((u) => u.pending).toReversed()
  const members = users.filter((u) => !u.pending)

  return (
    <ScrollArea render={<main />} scrollbar="plain" className="h-full min-w-0 flex-1">
      <div className="mx-auto flex max-w-220 flex-col gap-8 px-4 py-8 lg:px-8 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
            <h1 className="font-display text-display font-medium tracking-tight text-fg">Users</h1>
            <Badge variant={signupMode === 'invite' ? 'neutral' : 'info'}>
              {signupMode === 'invite' ? 'Invite-only' : 'Open sign-up'}
            </Badge>
          </div>
          <Button variant="secondary" size="sm" render={<Link to="/settings" />}>
            Settings
          </Button>
        </div>

        {waiting.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="text-title font-medium text-fg">Waiting for approval</h2>
                <Badge variant="info">{waiting.length}</Badge>
              </div>
              <p className="text-small text-fg/63">
                New accounts see a waiting screen until an admin approves them.
              </p>
            </div>
            <Card divided>
              {waiting.map((user) => (
                <UserRow key={user.id} user={user} isMe={user.id === session.id} />
              ))}
            </Card>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-title font-medium text-fg">Members</h2>
              <Badge variant="neutral">{members.length}</Badge>
            </div>
            <p className="text-small text-fg/63">
              Admins can approve new sign-ups, change roles, and remove accounts.
            </p>
          </div>
          <Card divided>
            {members.map((user) => (
              <UserRow key={user.id} user={user} isMe={user.id === session.id} />
            ))}
          </Card>
        </section>
      </div>
    </ScrollArea>
  )
}
