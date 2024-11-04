import React, { useEffect, useMemo, useState } from 'react'
import cx from 'classnames'
import { Link, Outlet, redirect, useLocation } from '@remix-run/react'
import { TELEGRAM_PHOTOS_URL } from '../../config/constants'
import styles from './auth.module.css'
import Button from '@valley/ui/Button'
import AuthHeader from '../../components/AuthHeader/AuthHeader'
import { LoaderFunctionArgs } from '@remix-run/node'
import useMediaQuery from '@valley/ui/useMediaQuery'
import Hidden from '@valley/ui/Hidden'
import { MIDDLE_VIEWPORT_WIDTH } from '@valley/ui/config/theme'

const covers = [
  '/assets/cover-1.jpg',
  '/assets/cover-2.jpg',
  '/assets/cover-3.jpg',
  '/assets/cover-4.jpg',
  '/assets/cover-5.jpg',
  '/assets/cover-6.jpg',
  '/assets/cover-7.jpg',
  '/assets/cover-8.jpg',
]
const COVER_SWITCH_INTERVAL = 10000

// Redirect from layout to an actual page (/auth/login)
export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  if (url.pathname === '/auth') {
    return redirect('/auth/login')
  }
  return null
}

const AuthGroupLayout = () => {
  const shouldShowCovers = useMediaQuery(
    `(min-width:${MIDDLE_VIEWPORT_WIDTH}px)`
  )
  const [activeCoverIndex, setActiveCoverIndex] = useState(0)
  const location = useLocation()
  const linkButton = useMemo(() => {
    let data = { href: '#', label: '' }
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
  }, [location.pathname])

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
        {linkButton}
      </div>
      <Hidden xs sm md asChild>
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
