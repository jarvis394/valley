import React, { Suspense } from 'react'
import styles from './Header.module.css'
import Logo from '../Logo/Logo'
import Slash from '../Slash/Slash'
import Avatar from '@valley/ui/Avatar'
import IconButton from '@valley/ui/IconButton'
import Button from '@valley/ui/Button'
import { LogoGithub } from 'geist-ui-icons'
import { HEADER_HEIGHT } from '../../config/constants'
import Stack from '@valley/ui/Stack'
import { Await, Link } from '@remix-run/react'
import type { Project, User } from '@valley/db'
import { useProjectAwait } from 'app/utils/project'
import Hidden from '@valley/ui/Hidden'
import MenuExpand from '../svg/MenuExpand'
import cx from 'classnames'
import Skeleton from '@valley/ui/Skeleton'
import { useUserAwait } from 'app/utils/user'

const PathPartSkeleton: React.FC<{
  hideSlashOnSm?: boolean
}> = ({ hideSlashOnSm }) => (
  <Stack
    data-fade-in="true"
    align={'center'}
    gap={2}
    className={styles.header__pathPart}
  >
    {hideSlashOnSm && (
      <Hidden asChild sm>
        <Slash />
      </Hidden>
    )}
    {!hideSlashOnSm && <Slash />}
    <Stack
      gap={3}
      align={'center'}
      className={styles.header__avatarAndNameContainer}
    >
      <Skeleton variant="circular" width={28} height={28} />
      <Skeleton asChild variant="text" width={96} height={20}>
        <p />
      </Skeleton>
    </Stack>
  </Stack>
)

const CurrentUser: React.FC<{ user?: User }> = ({ user }) => {
  return (
    <Stack
      align={'center'}
      gap={2}
      data-fade-in={!!user}
      className={cx('fade', styles.header__pathPart)}
    >
      <Hidden asChild sm>
        <Slash />
      </Hidden>
      <Stack
        asChild
        gap={3}
        align={'center'}
        className={styles.header__avatarAndNameContainer}
      >
        <Link to={'/projects'}>
          <Avatar />
          <p className={styles.header__noShrink}>{user?.fullname}</p>
        </Link>
      </Stack>
    </Stack>
  )
}

const CurrentProject: React.FC<{ project?: Project | null }> = ({
  project,
}) => {
  const [lastProject, setLastProject] = React.useState(project)

  React.useEffect(() => {
    project && setLastProject(project)
  }, [project])

  return (
    <Stack
      align={'center'}
      gap={2}
      data-fade-in={!!project}
      className={cx('fade', styles.header__pathPart)}
    >
      <Slash />
      <Stack gap={1} align={'center'} className={styles.header__shrink}>
        <Stack
          asChild
          gap={3}
          align={'center'}
          className={styles.header__avatarAndNameContainer}
        >
          <Link to={'/projects/' + project?.id}>
            <Avatar />
            <p>{lastProject?.title}</p>
          </Link>
        </Stack>
        <IconButton
          className={styles.header__menuIcon}
          size="sm"
          variant="tertiary"
        >
          <MenuExpand />
        </IconButton>
      </Stack>
    </Stack>
  )
}

const Header: React.FC = () => {
  const user = useUserAwait()
  const project = useProjectAwait()

  return (
    <header
      className={styles.header}
      style={{
        ['--header-height' as string]: HEADER_HEIGHT + 'px',
      }}
    >
      <Hidden asChild sm>
        <Link to="/">
          <Logo withScrollAnimation className={styles.header__logo} />
        </Link>
      </Hidden>
      <nav className={styles.header__nav}>
        <Stack gap={2} align={'center'} className={styles.header__shrink}>
          <Suspense fallback={<PathPartSkeleton hideSlashOnSm />}>
            <Await resolve={user}>
              {(resolvedUser) => <CurrentUser user={resolvedUser} />}
            </Await>
          </Suspense>
          <Suspense fallback={<PathPartSkeleton />}>
            <Await resolve={project?.project}>
              {(resolvedProject) => (
                <CurrentProject project={resolvedProject} />
              )}
            </Await>
          </Suspense>
        </Stack>
        <Stack gap={2} align={'center'} className={styles.header__after}>
          <Button size="sm" variant="secondary-dimmed" before={<LogoGithub />}>
            Leave a star
          </Button>
        </Stack>
      </nav>
    </header>
  )
}

export default React.memo(Header)
