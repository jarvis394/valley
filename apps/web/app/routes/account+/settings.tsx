import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { requireUserId } from '../../server/auth.server'
import { prisma } from '../../server/db.server'
import { invariantResponse } from '../../utils/invariant'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  })
  invariantResponse(user, 'User not found', { status: 404 })
  return json({})
}

export default function AccountSettings() {
  return <Outlet />
}
