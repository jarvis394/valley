import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { Button, CopyButton, Field, FormError, PasswordInput, TextInput } from '@valley/ui'
import { KeyRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { z } from 'zod'
import { AuthCard } from '../../components/auth/auth-card'
import { AuthColumn } from '../../components/auth/auth-column'
import { completeSetup } from '../../data/backend'
import { authClient } from '../../lib/auth'

const LOGS_COMMAND = 'docker compose logs web'

const searchSchema = z.object({ token: z.string().optional() })

export const Route = createFileRoute('/_auth/setup')({
  head: () => ({ meta: [{ title: 'Set up Valley' }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!context.setupRequired) throw redirect({ to: '/login' })
  },
  component: SetupPage,
})

function SetupPage() {
  const { token } = Route.useSearch()

  return (
    <AuthColumn>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="font-display text-display font-medium tracking-tight text-fg">
          Set up Valley
        </h1>
        <p className="text-body text-fg/63">Create the admin account for this instance</p>
      </div>
      <AuthCard>{token ? <SetupForm token={token} /> : <SetupLinkHint />}</AuthCard>
    </AuthColumn>
  )
}

function SetupLinkHint() {
  return (
    <div role="status" className="flex flex-col gap-3 select-text">
      <p className="flex items-center gap-2 text-body font-medium text-fg">
        <KeyRound className="size-4 shrink-0" opacity={0.63} />
        Open the setup link
      </p>
      <p className="text-body text-fg/63">
        Valley printed a one-time setup link to its server log, open it.
      </p>
      <p className="text-body text-fg/63">With Docker Compose, run this to find it:</p>
      <CommandBlock command={LOGS_COMMAND} />
    </div>
  )
}

function CommandBlock({ command }: { command: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-canvas py-1 pr-1 pl-3">
      <code className="min-w-0 flex-1 truncate bg-transparent p-0 font-mono text-small text-fg">
        {command}
      </code>
      <CopyButton size="sm" value={command} label="Copy command" copiedLabel="Command copied" />
    </div>
  )
}

function SetupForm({ token }: { token: string }) {
  const navigate = useNavigate()
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(undefined)
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    setPending(true)
    setError(undefined)

    try {
      await completeSetup({ data: { token, name: String(form.get('name')), email, password } })
    } catch (err) {
      setPending(false)
      setError(err instanceof Error ? err.message : 'Could not set up Valley. Try again.')

      return
    }

    const result = await authClient.signIn.email({ email, password })
    await router.invalidate()
    await navigate({ to: result.error ? '/login' : '/projects' })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Field variant="form" label="Name">
        <TextInput name="name" size="lg" placeholder="Alex" required autoComplete="name" />
      </Field>
      <Field variant="form" label="Email">
        <TextInput
          name="email"
          type="email"
          size="lg"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </Field>
      <Field variant="form" label="Password">
        <PasswordInput
          name="password"
          size="lg"
          placeholder="At least 8 characters"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
        />
      </Field>
      <FormError message={error} gap={3} />
      <Button type="submit" variant="primary" size="lg" className="mt-1 w-full" loading={pending}>
        Create admin account
      </Button>
    </form>
  )
}
