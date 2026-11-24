import {
  createFileRoute,
  getRouteApi,
  Link,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { Button } from '@valley/ui'
import { z } from 'zod'
import { AuthColumn } from '../../components/auth/auth-column'
import { authCopy, AuthForm, part } from '../../components/auth/auth-form'
import { getSessionState } from '../../data/backend'
import { describeAuthError, safeRedirect } from '../../lib/auth'

const searchSchema = z.object({
  redirect: z.string().optional(),
  error: z.string().optional(),
  reset: z.literal('done').optional(),
})

const authRoute = getRouteApi('/_auth')

export const Route = createFileRoute('/_auth/login')({
  head: () => ({ meta: [{ title: 'Sign in · Valley' }] }),
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    const state = await getSessionState()
    if (state.status === 'pending') throw redirect({ to: '/pending' })
    if (state.status === 'active') {
      const target = safeRedirect(search.redirect)
      if (target === '/projects') throw redirect({ to: '/projects' })
      throw redirect({ href: target })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { signupMode } = authRoute.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const copy = authCopy('sign-in', signupMode)
  const next = safeRedirect(search.redirect)

  const onSignedIn = async () => {
    const state = await getSessionState()
    await router.invalidate()
    if (state.status === 'pending') {
      await navigate({ to: '/pending' })

      return
    }
    if (next === '/projects') {
      await navigate({ to: '/projects' })

      return
    }
    await navigate({ href: next })
  }

  return (
    <AuthColumn
      footer={
        <Button
          variant="ghost"
          size="lg"
          style={part('switch')}
          render={<Link to="/signup" search={{ redirect: search.redirect }} viewTransition />}
        >
          {copy.switch}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="font-display text-display font-medium tracking-tight text-fg [view-transition-class:auth] [view-transition-name:auth-title]">
          {copy.title}
        </h1>
        <p className="text-body text-fg/63 [view-transition-class:auth] [view-transition-name:auth-subtitle]">
          {copy.subtitle}
        </p>
      </div>
      {search.reset === 'done' && (
        <p
          role="status"
          className="w-full rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-center text-small text-emerald-300"
        >
          Password updated. Sign in with your new password.
        </p>
      )}
      <AuthForm
        key={search.error ?? ''}
        mode="sign-in"
        signupMode={signupMode}
        initialError={describeAuthError(search.error)}
        onSignedIn={onSignedIn}
      />
    </AuthColumn>
  )
}
