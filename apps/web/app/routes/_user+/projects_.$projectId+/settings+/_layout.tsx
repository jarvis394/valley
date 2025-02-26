import React from 'react'
import { useParams } from '@remix-run/react'
import SettingsLayout from 'app/components/SettingsLayout/SettingsLayout'
import Stack from '@valley/ui/Stack'
import Divider from '@valley/ui/Divider'
import PageHeader from 'app/components/PageHeader/PageHeader'

const PROJECT_SETTINGS_TABS = [
  { label: 'General', to: '/general' },
  { label: 'Translation', to: '/translation' },
  { label: 'Protection', to: '/protection' },
]

const ProjectSettingsLayout = () => {
  const { projectId } = useParams()
  const basePath = `/projects/${projectId}/settings`

  return (
    <Stack direction={'column'} fullWidth>
      <PageHeader>Project Settings</PageHeader>
      <Divider />
      <SettingsLayout basePath={basePath} tabs={PROJECT_SETTINGS_TABS} />
    </Stack>
  )
}

export default ProjectSettingsLayout
