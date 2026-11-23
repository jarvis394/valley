import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AuthCoverShowcase } from '../components/auth/cover-showcase'
import { getAuthConfig } from '../data/backend'

export const Route = createFileRoute('/_auth')({
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
