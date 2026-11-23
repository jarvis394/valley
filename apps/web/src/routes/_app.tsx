import {
  createFileRoute,
  Outlet,
  redirect,
  useMatch,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { AppShell } from '../components/shell/app-shell'
import { AppSidebar } from '../components/shell/app-sidebar'
import { api } from '../data/api'
import { getPendingUsersCount, getSessionState } from '../data/backend'
import { authClient } from '../lib/auth'

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    const state = await getSessionState()
    if (state.status === 'signed-out') {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    if (state.status === 'pending') {
      throw redirect({ to: '/pending' })
    }

    return { session: state.user }
  },
  loader: async ({ context }) => {
    const [account, projects, pendingUsersCount] = await Promise.all([
      api.getAccount(),
      api.listProjects(),
      context.session.isAdmin ? getPendingUsersCount() : Promise.resolve(0),
    ])

    return { account, projects, pendingUsersCount }
  },
  component: AppLayout,
})

function AppLayout() {
  const { account, projects, pendingUsersCount } = Route.useLoaderData()
  const collapsed = Boolean(useMatch({ from: '/_app/projects/$projectId', shouldThrow: false }))
  const navigate = useNavigate()
  const router = useRouter()

  const signOut = () =>
    void authClient
      .signOut()
      .then(() => router.invalidate())
      .then(() => navigate({ to: '/login' }))

  return (
    <AppShell
      collapsed={collapsed}
      sidebar={
        <AppSidebar
          account={account}
          projects={projects}
          collapsed={collapsed}
          pendingUsersCount={pendingUsersCount}
          onSignOut={signOut}
        />
      }
    >
      <Outlet />
    </AppShell>
  )
}
