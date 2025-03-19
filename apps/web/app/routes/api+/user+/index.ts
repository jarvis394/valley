import { LoaderFunctionArgs } from '@remix-run/node'
import { requireUser } from 'app/server/auth/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request)
  return user
}
