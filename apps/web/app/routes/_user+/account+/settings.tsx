import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { Link, Outlet } from '@remix-run/react'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'

export const config = { runtime: 'edge' }

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export default function AccountSettings() {
  return (
    <Stack direction={'column'} gap={4} padding={4}>
      <Button asChild>
        <Link to="./authentication">authentication</Link>
      </Button>
      <Button asChild variant="secondary-dimmed">
        <Link to="/projects">/projects</Link>
      </Button>
      <Outlet />
    </Stack>
  )
}
