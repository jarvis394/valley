import app from '@adonisjs/core/services/app'
import { DatabaseClientType } from '@valley/db'

let db: DatabaseClientType

/**
 * Returns a singleton instance of the PrismaClient class from the
 * container.
 */
await app.booted(async () => {
  db = await app.container.make('drizzle:db')
})

export { db as default }
