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
import { Await, Link, useParams } from '@remix-run/react'
import { Project, User } from '@valley/db'
import { useProjectAwait } from 'app/utils/project'
import Hidden from '@valley/ui/Hidden'
import MenuExpand from '../svg/MenuExpand'

const CurrentUser: React.FC<{ user?: User }> = ({ user }) => {
  const { projectId } = useParams()

  return (
    <>
      <Hidden asChild sm>
        <Slash className="fade" data-fade-in={!!user} />
      </Hidden>
      <Stack gap={1} align={'center'} className="fade" data-fade-in={!!user}>
        <Stack
          asChild
          gap={3}
          align={'center'}
          className={styles.header__avatarAndNameContainer}
        >
          <Link to={'/projects'}>
            <Avatar />
            <p data-should-hide={!!projectId} className={styles.header__title}>
              {user?.fullname}
            </p>
          </Link>
        </Stack>
      </Stack>
    </>
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
    <>
      <Slash className="fade" data-fade-in={!!project} />
      <Stack className="fade" data-fade-in={!!project} gap={1} align={'center'}>
        <Stack
          gap={3}
          align={'center'}
          className={styles.header__avatarAndNameContainer}
        >
          <Avatar />
          <p className={styles.header__title}>{lastProject?.title}</p>
        </Stack>
        <IconButton
          className={styles.header__menuIcon}
          size="sm"
          variant="tertiary"
        >
          <MenuExpand />
        </IconButton>
      </Stack>
    </>
  )
}

type HeaderProps = {
  user?: Promise<User>
}

const Header: React.FC<HeaderProps> = ({ user }) => {
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
        <Stack gap={2} align={'center'}>
          <Suspense fallback={<h1>loading...</h1>}>
            <Await resolve={user}>
              {(resolvedUser) => <CurrentUser user={resolvedUser} />}
            </Await>
          </Suspense>
          <Suspense fallback={<h1>loading...</h1>}>
            <Await resolve={project?.project}>
              {(resolvedProject) => (
                <CurrentProject project={resolvedProject} />
              )}
            </Await>
          </Suspense>
        </Stack>
        <Stack gap={2} align={'center'}>
          <Button size="sm" variant="secondary-dimmed" before={<LogoGithub />}>
            Leave a star
          </Button>
        </Stack>
      </nav>
    </header>
  )
}

export default React.memo(Header)
