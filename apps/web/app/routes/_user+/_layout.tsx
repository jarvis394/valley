import React, { useEffect } from 'react'
import { Outlet, useLoaderData, useSubmit } from '@remix-run/react'
import styles from './styles.module.css'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireLoggedIn, requireUser } from '../../server/auth/auth.server'
import Stack from '@valley/ui/Stack'
import Spinner from '@valley/ui/Spinner'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireLoggedIn(request)
  const userPromise = requireUser(request)
  return { user: userPromise }
}

export const shouldRevalidate = () => {
  return false
}

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

/**
 * If an error happened at this stage, user's data load errored.
 * Log them out of their session.
 */
export function ErrorBoundary() {
  const submit = useSubmit()

  useEffect(() => {
    submit(
      {},
      {
        action: '/auth/logout',
        method: 'POST',
        viewTransition: true,
      }
    )
  }, [submit])

  return (
    <Stack
      fullWidth
      fullHeight
      gap={2}
      direction={'column'}
      align={'center'}
      justify={'center'}
    >
      <h1>Logging out...</h1>
      <Spinner style={{ ['--spinner-size' as string]: '32px' }} />
    </Stack>
  )
}

export default UserGroupLayout
