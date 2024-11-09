import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { requireUser } from '../../../server/auth.server'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  return json({ user })
}

export default function AccountSettings() {
  return <Outlet />
}
