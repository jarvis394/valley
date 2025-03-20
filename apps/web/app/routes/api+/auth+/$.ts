import { auth } from '@valley/auth' // Adjust the path as necessary
import { Route } from './+types/$'

export async function loader({ request }: Route.LoaderArgs) {
  return auth.handler(request)
}

export async function action({ request }: Route.ActionArgs) {
  return auth.handler(request)
}
