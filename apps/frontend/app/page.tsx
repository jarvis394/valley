import Link from 'next/link'
import Button from './components/Button/Button'
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
      <h1>Test</h1>
      <div style={{ display: 'flex' }}>
        <Link style={{ textDecoration: 'none' }} href="/projects">
          <Button>Go to projects</Button>
        </Link>
      </div>
    </div>
  )
}
