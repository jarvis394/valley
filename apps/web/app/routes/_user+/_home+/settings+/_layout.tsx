import React from 'react'
import SettingsLayout from 'app/components/SettingsLayout/SettingsLayout'
import Stack from '@valley/ui/Stack'
import Divider from '@valley/ui/Divider'
import PageHeader from 'app/components/PageHeader/PageHeader'

const basePath = '/settings'
const ACCOUNT_SETTINGS_TABS = [
  { label: 'General', to: '/general' },
  { label: 'Security', to: '/security' },
]

const AccountSettingsLayout = () => {
  return (
    <Stack direction={'column'} fullWidth>
      <PageHeader>Account Settings</PageHeader>
      <Divider />
      <SettingsLayout basePath={basePath} tabs={ACCOUNT_SETTINGS_TABS} />
    </Stack>
  )
}

export default React.memo(AccountSettingsLayout)
