import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common'
import type { FolderCreateReq, FolderCreateRes } from '@valley/shared'
import { FoldersService } from './folders.service'

@Controller('/projects/:id/folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post('create')
  async createFolder(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() data: FolderCreateReq
  ): Promise<FolderCreateRes> {
    const folder = await this.foldersService.createFolderForProject(
      projectId,
      data
    )
    return { folder }
  }
}
