import Stack from '@valley/ui/Stack'
import React, { useMemo } from 'react'
import styles from './AuthFormHeader.module.css'
import ButtonBase from '@valley/ui/ButtonBase'
import { Link } from '@remix-run/react'
import { PencilEdit } from 'geist-ui-icons'
import type { VerificationType } from '../../routes/_.auth+/verify+'
import { targetKey } from 'app/config/paramsKeys'

type HeaderProps = {
  title: React.ReactElement | string
  subtitle?: React.ReactElement | string
  email?: string | null
  emailEditHref?: string
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  email,
  emailEditHref,
}) => {
  return (
    <Stack gap={2} direction={'column'} className={styles.authFormHeader}>
      <h1>{title}</h1>
      <Stack gap={0.5} direction="column">
        <p>{subtitle}</p>
        {email && (
          <Stack
            className={styles.authFormHeader__email}
            direction="row"
            align="center"
            justify="center"
            gap={1}
          >
            {email}
            <ButtonBase
              asChild
              className={styles.authFormHeader__emailEdit}
              variant="tertiary"
            >
              <Link viewTransition to={emailEditHref || '#'}>
                <PencilEdit />
              </Link>
            </ButtonBase>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}

type AuthFormHeaderProps = {
  type?: VerificationType | 'password' | null
  email?: string | null
}

const AuthFormHeader: React.FC<AuthFormHeaderProps> = ({ type, email }) => {
  const emailEditHref = useMemo(() => {
    const path = type === 'onboarding' ? '/auth/register' : '/auth/login'
    const searchParams = new URLSearchParams()

    if (email) {
      searchParams.set(targetKey, email)
      return [path, searchParams.toString()].join('?')
    } else {
      return path
    }
  }, [email, type])

  switch (type) {
    case 'password':
      return (
        <Header
          title="Password"
          subtitle={
            <>
              Enter the password associated
              <br /> with your account
            </>
          }
          email={email}
          emailEditHref={emailEditHref}
        />
      )

    case 'change-email':
    case 'onboarding':
    case 'reset-password':
    case 'auth':
      return (
        <Header
          title="Check your email"
          subtitle={
            <>
              We&apos;ve sent you a code to verify
              <br /> your email address
            </>
          }
          email={email}
          emailEditHref={emailEditHref}
        />
      )

    case '2fa':
    default:
      return (
        <Header
          title="Check your 2FA app"
          subtitle="Enter your 2FA code to verify your identity."
        />
      )
  }
}

export default AuthFormHeader
