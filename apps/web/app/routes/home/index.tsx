import React from 'react'
import type { MetaFunction } from '@remix-run/node'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'
import { Link, useNavigation } from '@remix-run/react'
import { ThemeSwitch } from '../resources+/theme-switch'
import { useRootLoaderData } from 'app/utils/misc'

export const meta: MetaFunction = () => {
  return [
    { title: 'Valley' },
    { name: 'description', content: 'Platform for your photography sessions' },
  ]
}

const HomeRoute = () => {
  const data = useRootLoaderData()
  const navigation = useNavigation()

  return (
    <Stack direction={'column'} gap={4} padding={8}>
      <h1 style={{ margin: 0 }}>Testing!</h1>
      <ThemeSwitch userPreference={data?.requestInfo.userSettings.theme} />
      <Stack direction={'column'} gap={2}>
        <Button
          asChild
          size="md"
          variant="secondary-dimmed"
          loading={navigation.state === 'loading'}
          disabled={navigation.state === 'loading'}
        >
          <Link to="/auth/login">Login</Link>
        </Button>
        <Button variant="secondary-dimmed" asChild>
          <Link to="/projects">/projects</Link>
        </Button>
        <Button variant="secondary-dimmed" asChild>
          <Link to={{ pathname: '/projects', search: 'modal=create-project' }}>
            /projects/create-project
          </Link>
        </Button>
      </Stack>
    </Stack>
  )
}

export default HomeRoute
