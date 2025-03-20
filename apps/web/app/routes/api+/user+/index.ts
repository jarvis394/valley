import { requireUser } from 'app/server/auth/auth.server'
import { Route } from './+types'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireUser(request)
  return user
}
