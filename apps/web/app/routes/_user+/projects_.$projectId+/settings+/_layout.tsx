import Divider from '@valley/ui/Divider'
import Stack from '@valley/ui/Stack'
import Wrapper from '@valley/ui/Wrapper'
import PageHeader from 'app/components/PageHeader/PageHeader'
import React from 'react'
import styles from './projectSettings.module.css'
import Button from '@valley/ui/Button'
import { Link, Outlet, useLocation, useParams } from 'react-router'
import cx from 'classnames'
import Hidden from '@valley/ui/Hidden'
import ButtonBase from '@valley/ui/ButtonBase'
import { ArrowLeft } from 'geist-ui-icons'
import { MIDDLE_VIEWPORT_WIDTH } from '@valley/ui/config/theme'
import useMediaQuery from '@valley/ui/useMediaQuery'

const PROJECT_SETTINGS_TABS = [
  { label: 'General', to: '/general' },
  { label: 'Translation', to: '/translation' },
  { label: 'Protection', to: '/protection' },
]

const ProjectSettingsLayout = () => {
  const { projectId } = useParams()
  const shouldShowDefaultRoute = useMediaQuery(
    `(min-width:${MIDDLE_VIEWPORT_WIDTH}px)`
  )
  const location = useLocation()
  const basePath = `/projects/${projectId}/settings`
  const activeTab = location.pathname.slice(basePath.length)
  const shouldMakeDefaultRouteActive = !activeTab && shouldShowDefaultRoute

  return (
    <Stack direction={'column'} fullWidth>
      <PageHeader>Project Settings</PageHeader>
      <Divider />
      <Wrapper className={styles.projectSettings__wrapper} asChild>
        <Stack padding={{ sm: 0, md: 0, lg: 4, xl: 4 }} gap={12}>
          {!activeTab && (
            <Hidden asChild lg xl>
              <Stack direction={'column'} fullWidth>
                {PROJECT_SETTINGS_TABS.map((e, i) => (
                  <ButtonBase
                    key={i}
                    asChild
                    variant="tertiary"
                    className={styles.projectSettings__buttonTab}
                  >
                    <Link to={basePath + e.to}>{e.label}</Link>
                  </ButtonBase>
                ))}
              </Stack>
            </Hidden>
          )}
          <Hidden asChild sm md>
            <Stack
              direction={'column'}
              className={styles.projectSettings__tabs}
            >
              {PROJECT_SETTINGS_TABS.map((e, i) => (
                <Button
                  key={i}
                  asChild
                  fullWidth
                  align="start"
                  variant="tertiary"
                  size="lg"
                  className={cx(styles.projectSettings__tab, {
                    [styles['projectSettings__tab--active']]:
                      activeTab === e.to ||
                      (shouldMakeDefaultRouteActive && e.to === '/general'),
                  })}
                >
                  <Link to={basePath + e.to}>{e.label}</Link>
                </Button>
              ))}
            </Stack>
          </Hidden>
          <Hidden asChild {...(!activeTab && { sm: true, md: true })}>
            <Stack direction={'column'} fullWidth>
              <Hidden lg xl>
                <ButtonBase
                  asChild
                  variant="tertiary"
                  className={styles.projectSettings__buttonTab}
                >
                  <Link to={basePath}>
                    <ArrowLeft />
                    Back
                  </Link>
                </ButtonBase>
              </Hidden>
              <Stack padding={{ sm: 4, md: 4, lg: 0, xl: 0 }}>
                <Outlet />
              </Stack>
            </Stack>
          </Hidden>
        </Stack>
      </Wrapper>
    </Stack>
  )
}

export default ProjectSettingsLayout
