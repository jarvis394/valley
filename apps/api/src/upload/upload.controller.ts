import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { UploadService } from './upload.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { UploadAccessGuard } from './guards/uploadAccess.guard'
import { TusHookResponse, TusHookType } from '@valley/shared'
import type { TusHookData } from '@valley/shared'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard, UploadAccessGuard)
  @Post('/')
  async handleTusHook(@Body() data: TusHookData): Promise<TusHookResponse> {
    switch (data.Type) {
      case TusHookType.PRE_CREATE:
        return await this.uploadService.handlePreCreateHook(data)
      case TusHookType.PRE_FINISH:
        return await this.uploadService.handlePreFinishHook(data)
      default:
        return UploadService.defaultTusHandler(data)
    }
  }
}
