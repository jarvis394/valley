import { Controller, Get, Param, Query } from '@nestjs/common'
import { FilesService } from './files.service'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('/:key')
  async getFile(
    @Param('key') key: string,
    @Query('thumbnail') isThumbnail: string
  ) {
    if (isThumbnail) {
      return await this.filesService.streamFile(
        FilesService.getThumbnailKey(key)
      )
    }

    return await this.filesService.streamFile(key)
  }
}
