import { LoaderFunctionArgs } from '@vercel/remix'
import { getUserId } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { invariantResponse } from 'app/utils/invariant'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  invariantResponse(userId, 'User not found', { status: 404 })
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true, projects: true },
  })
  invariantResponse(user, 'User not found', { status: 404 })

  return user
}
