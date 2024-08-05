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
      <div style={{ display: 'flex' }}>
        <Link style={{ textDecoration: 'none' }} href="/auth/login">
          <Button>Login</Button>
        </Link>
      </div>
    </div>
  )
}
