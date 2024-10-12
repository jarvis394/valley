'use client'
import Header from '../components/Header/Header'
import React from 'react'
import styles from './styles.module.css'
import Footer from '../components/Footer/Footer'

const UserGroupLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className={styles.main}>
      <Header />
      <main className={styles.main__wrapper}>{children}</main>
      <Footer />
    </div>
  )
}

export default UserGroupLayout
