'use client'
import React, { useState, useEffect, useMemo } from 'react'
import styles from './styles.module.css'
import AuthHeader from './components/AuthHeader/AuthHeader'
import Button from '@valley/ui/Button'
import Image from 'next/image'
import cx from 'classnames'
import authCover1 from '../assets/cover-1.jpg'
import authCover2 from '../assets/cover-2.jpg'
import authCover3 from '../assets/cover-3.jpg'
import authCover4 from '../assets/cover-4.jpg'
import authCover5 from '../assets/cover-5.jpg'
import authCover6 from '../assets/cover-6.jpg'
import authCover7 from '../assets/cover-7.jpg'
import authCover8 from '../assets/cover-8.jpg'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TELEGRAM_PHOTOS_URL } from '../config/constants'

const covers = [
  authCover1,
  authCover2,
  authCover3,
  authCover4,
  authCover5,
  authCover6,
  authCover7,
  authCover8,
]
const COVER_SWITCH_INTERVAL = 10000

const AuthGroupLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [activeCoverIndex, setActiveCoverIndex] = useState(0)
  const pathname = usePathname()
  const linkButtonHref = useMemo(() => {
    if (pathname === '/auth/login') {
      return '/auth/register'
    } else {
      return '/auth/login'
    }
  }, [pathname])
  const linkButtonText = useMemo(() => {
    if (pathname === '/auth/login') {
      return 'I do not have an account'
    } else {
      return 'I have an account'
    }
  }, [pathname])

  useEffect(() => {
    const id = setInterval(() => {
      setActiveCoverIndex((prev) => (prev + 1) % covers.length)
    }, COVER_SWITCH_INTERVAL)

    return () => {
      clearInterval(id)
    }
  }, [])

  return (
    <div className={styles.auth}>
      <div className={styles.auth__section}>
        <AuthHeader />
        {children}
        <Button asChild fullWidth variant="tertiary" size="lg">
          <Link href={linkButtonHref} className={styles.auth__linkButton}>
            {linkButtonText}
          </Link>
        </Button>
      </div>
      <div className={styles.auth__section}>
        <div className={styles.auth__illustration}>
          {covers.map((cover, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              className={cx(styles.auth__illustrationImageBlur, {
                [styles['auth__illustrationImageBlur--visible']]:
                  i === activeCoverIndex,
              })}
              src={cover.blurDataURL}
              alt="Cover blur"
            />
          ))}
          {covers.map((cover, i) => (
            <Image
              key={i}
              className={cx(styles.auth__illustrationImage, {
                [styles['auth__illustrationImage--visible']]:
                  i === activeCoverIndex,
              })}
              quality={75}
              priority
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
    </div>
  )
}

export default AuthGroupLayout
