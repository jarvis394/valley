import { Link, Outlet } from 'react-router'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'

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
