import { Body, Controller, Post, Headers, RawBody } from '@nestjs/common'
import 'multer'
import { UploadService } from './upload.service'
import {
  FileMultipartUploadChunkReq,
  FileMultipartUploadCompleteReq,
  FileMultipartUploadStartReq,
} from '@valley/shared'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/start')
  async startMultipartUpload(@Body() data: FileMultipartUploadStartReq) {
    return await this.uploadService.startMultipartUpload(data)
  }

  @Post('/complete')
  async completeMultipartUpload(@Body() data: FileMultipartUploadCompleteReq) {
    return await this.uploadService.completeMultipartUpload(data)
  }

  @Post('/chunk')
  // @UseInterceptors(FileInterceptor('chunk'))
  async uploadMultipartChunk(
    @Headers('X-Valley-Upload-Id') uploadId: string,
    @Headers('X-Valley-Part') part: string,
    @Headers('X-Valley-Part-Size') partSize: string,
    @Headers('X-Valley-File-Size') fileSize: string,
    @RawBody() chunk: Express.Multer.File
    // @UploadedFile(
    //   new ParseFilePipe({
    //     validators: [
    //       new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 100 }),
    //       new FileTypeValidator({
    //         fileType:
    //           /[image/jpeg|image/png|image/webp|image/x\-adobe\-dng|image/x\-sony\-arw|]/g,
    //       }),
    //     ],
    //   })
    // )
    // chunk: Express.Multer.File
  ) {
    const data: FileMultipartUploadChunkReq = {
      partSize: Number(partSize),
      fileSize: Number(fileSize),
      uploadId,
      part: Number(part),
    }

    return await this.uploadService.uploadMultipartChunk(data, chunk)
  }
}
