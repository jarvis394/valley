import { redirect, type LoaderFunction } from '@vercel/remix'
import { isLoggedIn } from 'app/server/auth/auth.server'

export const loader: LoaderFunction = async ({ request }) => {
  const loggedIn = await isLoggedIn(request)

  if (loggedIn) {
    return redirect('/projects')
  } else {
    return redirect('/auth/login')
  }
}
