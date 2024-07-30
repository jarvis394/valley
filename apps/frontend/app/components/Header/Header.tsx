import React from 'react'
import styles from './Header.module.css'
import Logo from '../Logo/Logo'
import Link from 'next/link'
import Slash from '../Slash/Slash'
import Avatar from '../Avatar/Avatar'
import IconButton from '../IconButton/IconButton'
import MenuIcon from '../MenuIcon/MenuIcon'
import Button from '../Button/Button'
import { LogoGithub } from 'geist-ui-icons'

const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/">
        <Logo className={styles.header__logo} />
      </Link>
      <nav className={styles.header__nav}>
        <div className={styles.header__stack}>
          <Slash />
          <div className={styles.header__avatarAndNameContainer}>
            <Avatar />
            jarvis394
          </div>
          <IconButton size="sm" variant="secondary-dimmed">
            <MenuIcon />
          </IconButton>
        </div>
        <div className={styles.header__stack}>
          <Button size="sm" variant="secondary-dimmed" before={<LogoGithub />}>
            Leave a star
          </Button>
        </div>
      </nav>
    </header>
  )
}

export default Header
