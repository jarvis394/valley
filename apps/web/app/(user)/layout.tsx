import Header from '../components/Header/Header'
import Toolbar from '../components/Toolbar/Toolbar'
import React from 'react'
import styles from './styles.module.css'

const UserGroupLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Toolbar />
        {children}
      </main>
    </>
  )
}

export default UserGroupLayout
