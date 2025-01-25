import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import tusServer from '#services/tus_service'

@inject()
export default class StorageController {
  constructor(private ctx: HttpContext) {}

  async handleTusRequest() {
    return await tusServer.handle(
      this.ctx.request.request,
      this.ctx.response.response
    )
  }
}
