import { redirect, type LoaderFunction } from 'react-router'
import { isLoggedIn } from 'app/server/auth/auth.server'

export const loader: LoaderFunction = async ({ request }) => {
  const loggedIn = await isLoggedIn(request)

  if (loggedIn) {
    return redirect('/projects')
  } else {
    return redirect('/auth/login')
  }
}

export default function RootRoute() {
  return null
}
