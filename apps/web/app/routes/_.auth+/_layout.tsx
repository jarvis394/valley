import React, { useEffect, useMemo, useState } from 'react'
import cx from 'classnames'
import {
  Link,
  Outlet,
  ShouldRevalidateFunction,
  useLocation,
  useNavigate,
} from '@remix-run/react'
import { TELEGRAM_PHOTOS_URL } from '../../config/constants'
import styles from './auth.module.css'
import Button from '@valley/ui/Button'
import AuthHeader from '../../components/AuthHeader/AuthHeader'
import useMediaQuery from '@valley/ui/useMediaQuery'
import Hidden from '@valley/ui/Hidden'
import { MIDDLE_VIEWPORT_WIDTH } from '@valley/ui/config/theme'
import { requireAnonymous } from 'app/server/auth/auth.server'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { authClient } from '@valley/auth/client'
import Stack from '@valley/ui/Stack'
import Avatar from '@valley/ui/Avatar'
import IconButton from '@valley/ui/IconButton'
import { Logout } from 'geist-ui-icons'
import { useHydrated } from 'remix-utils/use-hydrated'

const covers = [
  '/assets/cover-1.webp',
  '/assets/cover-2.webp',
  '/assets/cover-3.webp',
  '/assets/cover-4.webp',
  '/assets/cover-5.webp',
  '/assets/cover-6.webp',
  '/assets/cover-7.webp',
  '/assets/cover-8.webp',
]
const COVER_SWITCH_INTERVAL = 7000

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return null
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction }) => {
  if (formAction) {
    return true
  }

  return false
}

const UserBlock = () => {
  const session = authClient.useSession()
  const navigate = useNavigate()
  const [isPending, setPending] = useState(false)
  const signOut = async () => {
    setPending(true)
    await authClient.signOut()
    navigate('/auth/login')
  }

  if (session.error || session.isPending) return null

  return (
    <Stack gap={2} align={'center'} className="fade-in">
      {session.data?.user.image && (
        <Avatar src={session.data?.user.image || undefined}>
          {session.data?.user.name[0]}
        </Avatar>
      )}
      <p className={styles.auth__userBlockName}>
        {session.data?.user.name || session.data?.user.email}
      </p>
      <IconButton
        loading={isPending}
        disabled={isPending}
        variant="tertiary-dimmed"
        onClick={signOut}
      >
        <Logout />
      </IconButton>
    </Stack>
  )
}

const AuthGroupLayout = () => {
  const shouldShowCovers = useMediaQuery(
    `(min-width:${MIDDLE_VIEWPORT_WIDTH}px)`
  )
  const [activeCoverIndex, setActiveCoverIndex] = useState(0)
  const location = useLocation()
  const isHydrated = useHydrated()
  const isOnboarding = location.pathname.startsWith('/auth/onboarding')
  const linkButton = useMemo(() => {
    let data = { href: '#', label: '' }

    if (isOnboarding) {
      return null
    }

    if (location.pathname.startsWith('/auth/login')) {
      data = { href: '/auth/register', label: 'I do not have an account' }
    } else if (location.pathname.startsWith('/auth/register')) {
      data = { href: '/auth/login', label: 'I have an account' }
    } else {
      return null
    }

    return (
      <Button asChild variant="tertiary" size="lg">
        <Link to={data.href} viewTransition className={styles.auth__linkButton}>
          {data.label}
        </Link>
      </Button>
    )
  }, [location.pathname, isOnboarding])

  useEffect(() => {
    if (!shouldShowCovers) {
      return
    }

    const id = setInterval(() => {
      setActiveCoverIndex((prev) => (prev + 1) % covers.length)
    }, COVER_SWITCH_INTERVAL)

    return () => {
      clearInterval(id)
    }
  }, [shouldShowCovers])

  return (
    <div className={styles.auth}>
      <div className={styles.auth__section}>
        <AuthHeader />
        <Outlet />
        <div className={styles.auth__bottom}>
          {linkButton}
          {isOnboarding && isHydrated && <UserBlock />}
        </div>
      </div>
      <Hidden sm md asChild>
        <div className={styles.auth__section}>
          <div className={styles.auth__illustration}>
            {covers.map((cover, i) => (
              <img
                key={i}
                src={cover}
                alt="Cover blur"
                className={cx(styles.auth__illustrationImageBlur, {
                  [styles['auth__illustrationImageBlur--visible']]:
                    i === activeCoverIndex,
                })}
              />
            ))}
            {covers.map((cover, i) => (
              <img
                key={i}
                loading="lazy"
                className={cx(styles.auth__illustrationImage, {
                  [styles['auth__illustrationImage--visible']]:
                    i === activeCoverIndex,
                })}
                src={cover}
                alt="Cover"
              />
            ))}
          </div>
          <a
            className={styles.auth__illustrationLink}
            target="_blank"
            rel="noopener noreferrer"
            href={TELEGRAM_PHOTOS_URL}
          >
            @tarnatovski
          </a>
        </div>
      </Hidden>
    </div>
  )
}

export default AuthGroupLayout
