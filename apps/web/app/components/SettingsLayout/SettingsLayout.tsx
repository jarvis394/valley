import Stack from '@valley/ui/Stack'
import Wrapper from '@valley/ui/Wrapper'
import React from 'react'
import styles from './SettingsLayout.module.css'
import Button from '@valley/ui/Button'
import { Link, Outlet, useLocation, useNavigation } from 'react-router'
import cx from 'classnames'
import Hidden from '@valley/ui/Hidden'
import ButtonBase from '@valley/ui/ButtonBase'
import { ArrowLeft } from 'geist-ui-icons'
import { MIDDLE_VIEWPORT_WIDTH } from '@valley/ui/config/theme'
import useMediaQuery from '@valley/ui/useMediaQuery'

type SettingsLayoutTabItem = {
  label: string
  to: string
}

type SettingsLayoutProps = {
  tabs: SettingsLayoutTabItem[]

  basePath?: string
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  tabs,
  basePath = '',
}) => {
  const shouldShowDefaultRoute = useMediaQuery(
    `(min-width:${MIDDLE_VIEWPORT_WIDTH}px)`
  )
  const location = useLocation()
  const activeTab = location.pathname.slice(basePath.length)
  const shouldMakeDefaultRouteActive = !activeTab && shouldShowDefaultRoute
  const navigation = useNavigation()
  const isRouteLoading = (url: string) => {
    return (
      navigation.state === 'loading' &&
      !navigation.formAction &&
      navigation.location?.pathname === url
    )
  }

  return (
    <Wrapper className={styles.settings__wrapper} asChild>
      <Stack padding={{ sm: 0, md: 0, lg: 4, xl: 4 }} gap={12}>
        {!activeTab && (
          <Hidden asChild lg xl>
            <Stack direction={'column'} fullWidth>
              {tabs.map((e, i) => (
                <ButtonBase
                  key={i}
                  asChild
                  variant="tertiary"
                  shimmer={isRouteLoading(basePath + e.to)}
                  className={styles.settings__buttonTab}
                >
                  <Link to={basePath + e.to}>{e.label}</Link>
                </ButtonBase>
              ))}
            </Stack>
          </Hidden>
        )}
        <Hidden asChild sm md>
          <Stack direction={'column'} className={styles.settings__tabs}>
            {tabs.map((e, i) => (
              <Button
                key={i}
                asChild
                fullWidth
                align="start"
                variant="tertiary"
                size="lg"
                shimmer={isRouteLoading(basePath + e.to)}
                className={cx(styles.settings__tab, {
                  [styles['settings__tab--active']]:
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
                className={styles.settings__buttonTab}
              >
                <Link to={basePath}>
                  <ArrowLeft />
                  Back
                </Link>
              </ButtonBase>
            </Hidden>
            <Stack
              className={styles.settings__outlet}
              padding={{ sm: 4, md: 4, lg: 0, xl: 0 }}
              direction={'column'}
              gap={4}
            >
              <Outlet />
            </Stack>
          </Stack>
        </Hidden>
      </Stack>
    </Wrapper>
  )
}

export default React.memo(SettingsLayout)
