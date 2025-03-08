import React, { useEffect } from 'react'
import {
  Await,
  Outlet,
  ShouldRevalidateFunction,
  useLoaderData,
  useSubmit,
} from '@remix-run/react'
import styles from './styles.module.css'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireLoggedIn, requireUserId } from '../../server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { UserFull } from '@valley/shared'
import { useUserStore } from 'app/utils/user'
import Stack from '@valley/ui/Stack'
import Spinner from '@valley/ui/Spinner'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireLoggedIn(request)
  // TODO: deal with `throw redirect` in defer loders
  const userId = await requireUserId(request)
  const user = new Promise<UserFull | null>((res) =>
    prisma.user
      .findUnique({
        where: { id: userId },
        include: {
          settings: true,
        },
      })
      .then(res)
  )

  return { user }
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction }) => {
  if (formAction?.startsWith('/api/user')) {
    return true
  }

  return false
}

const UserCache: React.FC<{ user: UserFull | null }> = ({ user }) => {
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    user && setUser(user)
  }, [setUser, user])

  return null
}

const UserGroupLayout: React.FC = () => {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className={styles.main}>
      <Header />
      <main className={styles.main__wrapper}>
        <Outlet />
      </main>
      <Footer />
      <Await resolve={user}>
        {(resolvedUser) => <UserCache user={resolvedUser} />}
      </Await>
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
