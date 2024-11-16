import { Link } from '@remix-run/react'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'
import { showToast } from 'app/components/Toast/Toast'
import React from 'react'

const ProjectsRoute = () => {
  return (
    <Stack direction={'column'} gap={4} padding={4}>
      <Button asChild>
        <Link to="/account/settings">/account/settings</Link>
      </Button>
      <Button
        variant="secondary-dimmed"
        onClick={() =>
          showToast({
            title: 'Test title',
            description: 'Test description, very long',
            type: 'info',
            id: 'test',
          })
        }
      >
        Show toast
      </Button>
    </Stack>
  )
}

export default ProjectsRoute
