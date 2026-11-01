import { createFileRoute, Outlet, useMatch } from '@tanstack/react-router'
import { AppShell } from '../components/shell/app-shell'
import { AppSidebar } from '../components/shell/app-sidebar'
import { api } from '../data/api'

export const Route = createFileRoute('/_app')({
  loader: async () => {
    const [account, projects] = await Promise.all([api.getAccount(), api.listProjects()])

    return { account, projects }
  },
  component: AppLayout,
})

function AppLayout() {
  const { account, projects } = Route.useLoaderData()
  const collapsed = Boolean(useMatch({ from: '/_app/projects/$projectId', shouldThrow: false }))

  return (
    <AppShell
      collapsed={collapsed}
      sidebar={<AppSidebar account={account} projects={projects} collapsed={collapsed} />}
    >
      <Outlet />
    </AppShell>
  )
}
