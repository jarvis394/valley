import React from 'react'
import { Outlet, useLoaderData } from '@remix-run/react'
import styles from './styles.module.css'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { requireLoggedIn, requireUser } from '../../server/auth/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireLoggedIn(request)
  const userPromise = requireUser(request)
  return { user: userPromise }
}

export const shouldRevalidate = () => true

const UserGroupLayout: React.FC = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <div className={styles.main}>
      <Header user={data.user} />
      <main className={styles.main__wrapper}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default UserGroupLayout
