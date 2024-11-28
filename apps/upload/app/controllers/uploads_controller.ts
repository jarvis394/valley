import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import UploadService from '#services/upload_service'
import { TusHookType, type TusHookData } from '@valley/shared'

@inject()
export default class UploadsController {
  constructor(
    private ctx: HttpContext,
    private readonly uploadService: UploadService
  ) {}

  async handleTusHook() {
    const data = this.ctx.request.body() as TusHookData

    switch (data.Type) {
      case TusHookType.PRE_CREATE:
        return await this.uploadService.handlePreCreateHook(data)
      case TusHookType.PRE_FINISH:
        return await this.uploadService.handlePreFinishHook(data)
      default:
        return UploadService.defaultTusHandler(data)
    }
  }

  // TODO -- implement
  async getUploadToken() {
    return {}
  }
}
