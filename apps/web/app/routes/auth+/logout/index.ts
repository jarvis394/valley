import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { logout } from 'app/server/auth/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
  return logout({ request })
}

export async function action({ request }: ActionFunctionArgs) {
  return logout({ request })
}
