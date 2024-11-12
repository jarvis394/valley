import React, { Suspense } from 'react'
import styles from './Header.module.css'
import Logo from '../Logo/Logo'
import Slash from '../Slash/Slash'
import Avatar from '@valley/ui/Avatar'
import IconButton from '@valley/ui/IconButton'
import MenuIcon from '../svg/MenuIcon'
import Button from '@valley/ui/Button'
import { LogoGithub } from 'geist-ui-icons'
import { HEADER_HEIGHT } from '../../config/constants'
import Stack from '@valley/ui/Stack'
import { Await, Link, useParams } from '@remix-run/react'
import { User } from '@valley/db'

const CurrentUser: React.FC<{ user: User }> = ({ user }) => {
  return (
    <>
      <Slash className="fade" data-fade-in={!!user} />
      <Stack gap={4} align={'center'} className="fade" data-fade-in={!!user}>
        <Stack
          asChild
          gap={3}
          align={'center'}
          className={styles.header__avatarAndNameContainer}
        >
          <Link to={'/projects'}>
            <Avatar />
            {user?.fullname}
          </Link>
        </Stack>
        <IconButton size="sm" variant="secondary-dimmed">
          <MenuIcon />
        </IconButton>
      </Stack>
    </>
  )
}

const CurrentProject = () => {
  const { id: _projectId } = useParams()

  return (
    <>
      <Slash className="fade" data-fade-in={true} />
      <Stack className="fade" data-fade-in={true} gap={4} align={'center'}>
        <Stack
          gap={3}
          align={'center'}
          className={styles.header__avatarAndNameContainer}
        >
          test project
        </Stack>
      </Stack>
    </>
  )
}

type HeaderProps = {
  user?: Promise<User>
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header
      className={styles.header}
      style={{
        ['--header-height' as string]: HEADER_HEIGHT + 'px',
      }}
    >
      <Link to="/">
        <Logo withScrollAnimation className={styles.header__logo} />
      </Link>
      <nav className={styles.header__nav}>
        <Stack gap={2} align={'center'}>
          {user && (
            <Suspense fallback={<h1>loading...</h1>}>
              <Await resolve={user} errorElement={<h1>error</h1>}>
                {(resolvedUser) => <CurrentUser user={resolvedUser} />}
              </Await>
            </Suspense>
          )}
          <CurrentProject />
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

export default Header
