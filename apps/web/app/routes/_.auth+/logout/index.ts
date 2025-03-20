import { redirect } from 'react-router'
import { auth } from '@valley/auth'
import { Route } from './+types'

const logout = async (request: Request) => {
  const response = await auth.api.signOut({
    headers: request.headers,
    asResponse: true,
  })

  return redirect('/auth/login', { headers: response.headers })
}

export function loader({ request }: Route.LoaderArgs) {
  return logout(request)
}

export function action({ request }: Route.ActionArgs) {
  return logout(request)
}
