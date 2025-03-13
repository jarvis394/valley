import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { auth } from '@valley/auth'

const logout = async (request: Request) => {
  const response = await auth.api.signOut({
    headers: request.headers,
    asResponse: true,
  })

  return redirect('/auth/login', { headers: response.headers })
}

export function loader({ request }: LoaderFunctionArgs) {
  return logout(request)
}

export function action({ request }: ActionFunctionArgs) {
  return logout(request)
}
