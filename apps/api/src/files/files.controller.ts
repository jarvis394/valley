import { Controller, Get, Param } from '@nestjs/common'
import { FilesService } from './files.service'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('/:key')
  async getFile(@Param('key') key: string) {
    return await this.filesService.streamFile(key)
  }
}
