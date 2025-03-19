import { ApplicationService } from '@adonisjs/core/types'
import { HttpContext } from '@adonisjs/core/http'
import { type DatabaseClientType, db } from '@valley/db'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'drizzle:db': DatabaseClientType
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    db: DatabaseClientType
  }
}

export default class DrizzleProvider {
  constructor(protected app: ApplicationService) {}

  static makePrismaClient() {
    return db
  }

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton('drizzle:db', async () => {
      return DrizzleProvider.makePrismaClient()
    })
  }

  /**
   * The container bindings have booted
   */
  async boot() {
    const drizzleDb = await this.app.container.make('drizzle:db')
    HttpContext.getter('db', function (this: HttpContext) {
      return drizzleDb
    })
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}
}
