import Link from 'next/link'
import Button from '@valley/ui/Button'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Valley',
  description: 'Platform for your photography sessions',
}

export default function Home() {
  return (
    <div
      style={{ padding: 16, gap: 16, display: 'flex', flexDirection: 'column' }}
    >
      <h1>Testing!</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link style={{ textDecoration: 'none' }} href="/auth/login">
          <Button>Login</Button>
        </Link>
        <Link style={{ textDecoration: 'none' }} href="/create-project">
          <Button variant="secondary-dimmed">create-project</Button>
        </Link>
        <Link style={{ textDecoration: 'none' }} href="/projects">
          <Button variant="secondary-dimmed">projects</Button>
        </Link>
        <Link
          style={{ textDecoration: 'none' }}
          href={{ pathname: '/projects', query: { modal: 'create-project' } }}
        >
          <Button variant="secondary-dimmed">projects/create-project</Button>
        </Link>
        <Link style={{ textDecoration: 'none' }} href="/projects/1">
          <Button variant="secondary-dimmed">projects/1</Button>
        </Link>
      </div>
    </div>
  )
}
