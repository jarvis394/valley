import { redirect, type LoaderFunction } from 'react-router'
import { auth } from '@valley/auth'

export const loader: LoaderFunction = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers })

  if (session) {
    return redirect('/projects')
  } else {
    return redirect('/auth/login')
  }
}
