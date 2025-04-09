import { tusServer } from 'app/server/services/tus.server'
import { Route } from './+types/storage.$'

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await tusServer.handleWeb(request)
}

export const action = async ({ request }: Route.ActionArgs) => {
  return await tusServer.handleWeb(request)
}
