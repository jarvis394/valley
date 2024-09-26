import { Controller, Get, Param, Query, Res } from '@nestjs/common'
import { FilesService } from './files.service'
import type { Response } from 'express'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':project/:folder/:key')
  async getFile(
    @Param('project') project: string,
    @Param('folder') folder: string,
    @Param('key') key: string,
    @Res() res: Response,
    @Query('thumbnail') isThumbnail?: string
  ) {
    const filePath = [project, folder, key].join('/')

    if (isThumbnail) {
      return await this.filesService.streamFile(
        FilesService.makeThumbnailUploadPath(filePath),
        res
      )
    }

    return await this.filesService.streamFile(filePath, res)
  }
}
