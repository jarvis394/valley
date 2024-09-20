import React from 'react'
import styles from './Header.module.css'
import Logo from '../Logo/Logo'
import Link from 'next/link'
import Slash from '../Slash/Slash'
import Avatar from '@valley/ui/Avatar'
import IconButton from '@valley/ui/IconButton'
import MenuIcon from '../MenuIcon/MenuIcon'
import Button from '@valley/ui/Button'
import { LogoGithub } from 'geist-ui-icons'
import useSWR from 'swr'
import { api } from '../../api'
import { ProjectGetRes, UserGetSelfRes } from '@valley/shared'
import { HEADER_HEIGHT } from '../../config/constants'
import Stack from '@valley/ui/Stack'
import { useParams } from 'next/navigation'

const CurrentUser = () => {
  const me = useSWR<UserGetSelfRes>(
    '/users/me',
    api({ isAccessTokenRequired: true })
  )

  return (
    <>
      <Slash className="fade" data-fade-in={!!me.data} />
      <Stack gap={4} align={'center'} className="fade" data-fade-in={!!me.data}>
        <Stack
          component={Link}
          href={'/projects'}
          gap={3}
          align={'center'}
          className={styles.header__avatarAndNameContainer}
        >
          <Avatar />
          {me.data?.user?.username}
        </Stack>
        <IconButton size="sm" variant="secondary-dimmed">
          <MenuIcon />
        </IconButton>
      </Stack>
    </>
  )
}

const CurrentProject = () => {
  const { id: projectId } = useParams()
  const project = useSWR<ProjectGetRes>(
    projectId ? '/projects/' + projectId : null,
    api({ isAccessTokenRequired: true }),
    {
      keepPreviousData: true,
    }
  )
  const isShown = !!projectId && !!project.data

  return (
    <>
      <Slash className="fade" data-fade-in={isShown} />
      <Stack className="fade" data-fade-in={isShown} gap={4} align={'center'}>
        <Stack
          gap={3}
          align={'center'}
          className={styles.header__avatarAndNameContainer}
        >
          {project.data?.project?.title}
        </Stack>
      </Stack>
    </>
  )
}

const Header = () => {
  return (
    <header
      className={styles.header}
      style={{
        ['--header-height' as string]: HEADER_HEIGHT + 'px',
      }}
    >
      <Link href="/">
        <Logo withScrollAnimation className={styles.header__logo} />
      </Link>
      <nav className={styles.header__nav}>
        <Stack gap={2} align={'center'}>
          <CurrentUser />
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
