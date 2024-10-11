import Link from 'next/link'
import Button from '@valley/ui/Button'
import { Metadata } from 'next'
import Stack from '@valley/ui/Stack'

export const metadata: Metadata = {
  title: 'Valley',
  description: 'Platform for your photography sessions',
}

export default function Home() {
  return (
    <Stack direction={'column'} gap={4} padding={8}>
      <h1 style={{ margin: 0 }}>Testing!</h1>
      <Stack direction={'column'} gap={2}>
        <Button asChild>
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button variant="secondary-dimmed" asChild>
          <Link href="/projects">/projects</Link>
        </Button>
        <Button variant="secondary-dimmed" asChild>
          <Link
            href={{ pathname: '/projects', query: { modal: 'create-project' } }}
          >
            /projects/create-project
          </Link>
        </Button>
      </Stack>
    </Stack>
  )
}
