import { auth } from '@valley/auth' // Adjust the path as necessary
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'

export async function loader({ request }: LoaderFunctionArgs) {
  return auth.handler(request)
}

export async function action({ request }: ActionFunctionArgs) {
  return auth.handler(request)
}
