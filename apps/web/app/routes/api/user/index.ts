import { LoaderFunctionArgs } from '@remix-run/node'
import { getUserId } from 'app/server/auth.server'
import { prisma } from 'app/server/db.server'
import { invariantResponse } from 'app/utils/invariant'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  invariantResponse(userId, 'User not found', { status: 404 })
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  invariantResponse(user, 'User not found', { status: 404 })

  return user
}
