import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import TusService from '#services/tus_service'
import { Server } from '@tus/server'

@inject()
export default class StorageController {
  tusServer: Server

  constructor(
    private ctx: HttpContext,
    tusService: TusService
  ) {
    this.tusServer = tusService.makeTusServer()
  }

  async handleTusRequest() {
    return await this.tusServer.handle(
      this.ctx.request.request,
      this.ctx.response.response
    )
  }
}
