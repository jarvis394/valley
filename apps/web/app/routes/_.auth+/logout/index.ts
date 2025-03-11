import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { auth } from '@valley/auth'

export async function loader({ request }: LoaderFunctionArgs) {
  return await auth.api.signOut({ headers: request.headers })
}

export async function action({ request }: ActionFunctionArgs) {
  return await auth.api.signOut({ headers: request.headers })
}
