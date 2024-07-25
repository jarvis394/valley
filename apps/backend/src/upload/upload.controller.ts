import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import 'multer'
import { UploadService } from './upload.service'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 100 }),
          new FileTypeValidator({
            fileType:
              /[image/jpeg|image/png|image/webp|image/x\-adobe\-dng|image/x\-sony\-arw|]/g,
          }),
        ],
      })
    )
    files: Express.Multer.File[]
  ) {
    return await this.uploadService.processFiles(files)
  }
}
