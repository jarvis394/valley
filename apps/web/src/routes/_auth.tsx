import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AuthCoverShowcase } from '../components/auth/cover-showcase'
import { getAuthConfig, getSetupRequired } from '../data/backend'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    const setupRequired = await getSetupRequired()
    if (setupRequired && location.pathname !== '/setup') throw redirect({ to: '/setup' })

    return { setupRequired }
  },
  loader: () => getAuthConfig(),
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-dvh bg-canvas text-fg">
      <Outlet />
      <AuthCoverShowcase />
    </div>
  )
}
