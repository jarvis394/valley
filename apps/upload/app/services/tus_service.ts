import app from '@adonisjs/core/services/app'
import { Server } from '@tus/server'

let tusServer: Server

/**
 * Returns a singleton instance of the TusServer class from the
 * container.
 */
await app.booted(async () => {
  tusServer = await app.container.make('tus:server')
})

export { tusServer as default }
