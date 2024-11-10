import React from 'react'
import { Outlet } from '@remix-run/react'
import styles from './styles.module.css'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { requireUser } from '../../server/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request)
  return json({ user })
}

const UserGroupLayout: React.FC = () => {
  return (
    <div className={styles.main}>
      <Header />
      <main className={styles.main__wrapper}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default UserGroupLayout
