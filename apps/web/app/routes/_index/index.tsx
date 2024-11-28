import { redirect, type LoaderFunction } from '@remix-run/node'
import { isLoggedIn } from 'app/server/auth/auth.server'

export const config = { runtime: 'edge' }

export const loader: LoaderFunction = async ({ request }) => {
  const loggedIn = await isLoggedIn(request)

  if (loggedIn) {
    return redirect('/projects')
  } else {
    return redirect('/auth/login')
  }
}
