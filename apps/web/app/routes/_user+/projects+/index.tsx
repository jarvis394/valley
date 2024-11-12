import { Link } from '@remix-run/react'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'
import React from 'react'

const ProjectsRoute = () => {
  return (
    <Stack direction={'column'} gap={4} padding={4}>
      <Button asChild>
        <Link to="/account/settings">/account/settings</Link>
      </Button>
    </Stack>
  )
}

export default ProjectsRoute
