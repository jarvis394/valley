import { Controller, Get } from '@nestjs/common'
import { FilesService } from './files.service'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':project/:folder/:key')
  async getFile() {}
}
