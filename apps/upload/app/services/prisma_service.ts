import app from '@adonisjs/core/services/app'
import { PrismaClient } from '@valley/db'

let prisma: PrismaClient

/**
 * Returns a singleton instance of the PrismaClient class from the
 * container.
 */
await app.booted(async () => {
  prisma = await app.container.make('prisma:db')
})

export { prisma as default }
