import { Body, Controller, Post } from '@nestjs/common'
import { UploadService } from './upload.service'

export enum TusEventType {
  PRE_CREATE = 'pre-create',
  POST_CREATE = 'post-create',
  POST_RECEIVE = 'post_receive',
  PRE_FINISH = 'pre-finish',
  POST_FINISH = 'post-finish',
  POST_TERMINATE = 'post-terminate',
}

export type TusHookData = {
  Type: TusEventType
  Event: {
    Upload: {
      ID: string
      Size: number
      Offset: number
      MetaData: {
        filename: string
        filetype: string
        name: string
        normalizedName: string
        type: string
      }
      IsPartial: boolean
      IsFinal: boolean
      PartialUploads: unknown
      Storage: {
        Bucket: string
        Key: string
        Type: string
      }
    }
    HTTPRequest: {
      Method: string
      URI: string
      RemoteAddr: string
      Header: Record<string, string>
    }
  }
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/')
  async handleTusHook(@Body() data: TusHookData) {
    switch (data.Type) {
      case TusEventType.POST_CREATE:
        return await this.uploadService.finalizeUpload(data.Event)
      default:
        return { ok: true }
    }
  }
}
