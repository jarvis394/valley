import { User } from '@valley/db'
import { prisma } from './db.server'

export async function getUserByEmail(email: User['email']) {
  return await prisma.user.findUnique({ where: { email } })
}
