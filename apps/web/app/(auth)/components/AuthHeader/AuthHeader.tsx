import React from 'react'
import styles from './AuthHeader.module.css'
import Logo from '../../../components/Logo/Logo'
import Link from 'next/link'
import Button from '@valley/ui/Button'
import { LogoGithub } from 'geist-ui-icons'

const AuthHeader: React.FC = () => {
  return (
    <header className={styles.header}>
      <Link href="/">
        <Logo className={styles.header__logo} />
      </Link>
      <div className={styles.header__stack}>
        <Button size="sm" variant="secondary-dimmed" before={<LogoGithub />}>
          Leave a star
        </Button>
      </div>
    </header>
  )
}

export default AuthHeader
