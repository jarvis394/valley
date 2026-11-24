import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@valley/ui'
import { Hourglass, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AuthCard } from '../../components/auth/auth-card'
import { AuthColumn } from '../../components/auth/auth-column'
import { getSessionState } from '../../data/backend'
import { authClient } from '../../lib/auth'

const RECHECK_MS = 30_000

export const Route = createFileRoute('/_auth/pending')({
  head: () => ({ meta: [{ title: 'Waiting for approval · Valley' }] }),
  beforeLoad: async () => {
    const state = await getSessionState()
    if (state.status === 'signed-out') throw redirect({ to: '/login' })
    if (state.status === 'active') throw redirect({ to: '/projects' })

    return { user: state.user }
  },
  component: PendingPage,
})

function PendingPage() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- polls approval status until an admin admits the account
  useEffect(() => {
    const id = window.setInterval(() => {
      void getSessionState().then(async (state) => {
        if (state.status === 'active') {
          await router.invalidate()
          await navigate({ to: '/projects' })
        } else if (state.status === 'signed-out') {
          await router.invalidate()
          await navigate({ to: '/login' })
        }
      })
    }, RECHECK_MS)

    return () => window.clearInterval(id)
  }, [navigate, router])

  const signOut = async () => {
    setSigningOut(true)
    await authClient.signOut()
    await router.invalidate()
    await navigate({ to: '/login' })
  }

  return (
    <AuthColumn>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="font-display text-display font-medium tracking-tight text-fg">
          Waiting for approval
        </h1>
        <p className="text-body text-fg/63">Your email is confirmed</p>
      </div>
      <AuthCard>
        <div role="status" className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Hourglass className="mt-0.5 size-4 shrink-0 text-fg/63" />
            <div className="min-w-0">
              <p className="text-body font-medium text-fg">Sign-up pending approval</p>
              <p className="mt-1 text-body text-fg/63">
                Valley is invite-only. An admin needs to approve your account before you can open
                the editor. This page opens the app automatically once approved, and we will email{' '}
                <span className="text-fg">{user.email}</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-white/7 pt-4">
            <p className="min-w-0 truncate text-small text-fg/63">
              Signed in as <span className="text-fg">{user.name}</span>
            </p>
            <Button
              variant="danger"
              size="sm"
              icon={<LogOut className="size-4" />}
              loading={signingOut}
              onClick={() => void signOut()}
            >
              Sign out
            </Button>
          </div>
        </div>
      </AuthCard>
    </AuthColumn>
  )
}
