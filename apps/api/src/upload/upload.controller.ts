import { Body, Controller, Post } from '@nestjs/common'
import { UploadService } from './upload.service'

export enum TusEventType {
  PRE_CREATE = 'pre-create',
  POST_CREATE = 'post-create',
  POST_RECEIVE = 'post-receive',
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
    console.log(data.Event.Upload.MetaData)

    let res: Record<string, string> = { ok: 'true' }
    switch (data.Type) {
      case TusEventType.PRE_FINISH:
        res = await this.uploadService.finalizeUpload(data.Event)
        break
      default:
        break
    }

    return {
      HTTPResponse: {
        StatusCode: 201,
        Body: JSON.stringify({ ...res, type: data.Type }),
        Header: {
          'Content-Type': 'application/json',
        },
      },
    }
  }
}
