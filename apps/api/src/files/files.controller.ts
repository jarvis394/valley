import { Controller, Get, Param, Query, Res } from '@nestjs/common'
import { FilesService } from './files.service'
import type { Response } from 'express'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('/:key')
  async getFile(
    @Param('key') key: string,
    @Query('thumbnail') isThumbnail: string,
    @Res() res: Response
  ) {
    if (isThumbnail) {
      return await this.filesService.streamFile(
        FilesService.getThumbnailKey(key),
        res
      )
    }

    return await this.filesService.streamFile(key, res)
  }
}
