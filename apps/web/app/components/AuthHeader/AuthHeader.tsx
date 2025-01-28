import React from 'react'
import styles from './AuthHeader.module.css'
import Logo from '../Logo/Logo'
import Button from '@valley/ui/Button'
import { LogoGithub } from 'geist-ui-icons'
import { Link } from 'react-router'

const AuthHeader: React.FC = () => {
  return (
    <header className={styles.header}>
      <Link to="/">
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
