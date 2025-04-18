import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import FileService from '#services/file_service'

@inject()
export default class FilesController {
  constructor(
    private ctx: HttpContext,
    private readonly fileService: FileService
  ) {}

  async handle() {
    const { project, folder, key } = this.ctx.params
    const filePath = [project, folder, key].join('/')

    return this.fileService.streamFile(filePath, this.ctx.response)
  }
}
