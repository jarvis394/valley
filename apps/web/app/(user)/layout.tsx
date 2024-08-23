import Header from '../components/Header/Header'
import React from 'react'
import styles from './styles.module.css'

const UserGroupLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header />
      <main className={styles.main}>{children}</main>
    </>
  )
}

export default UserGroupLayout
