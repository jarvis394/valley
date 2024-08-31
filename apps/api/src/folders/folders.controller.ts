import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import type {
  FolderCreateReq,
  FolderCreateRes,
  FolderEditReq,
  FolderEditRes,
  FolderGetRes,
} from '@valley/shared'
import { FoldersService } from './folders.service'
import { FilesService } from 'src/files/files.service'
import { JwtAuthGuard } from 'src/auth/strategies/jwt.strategy'
import type { RequestWithUser } from 'src/auth/auth.controller'

@Controller('/projects/:projectId/folders')
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly filesService: FilesService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createFolder(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() data: FolderCreateReq,
    @Req() req: RequestWithUser
  ): Promise<FolderCreateRes> {
    const folder = await this.foldersService.createProjectFolder({
      userId: req.user.userId,
      projectId,
      data,
    })
    return { folder, files: [] }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':folderId/edit')
  async editFolder(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Body() data: FolderEditReq,
    @Req() req: RequestWithUser
  ): Promise<FolderEditRes> {
    const folder = await this.foldersService.editProjectFolder({
      userId: req.user.userId,
      projectId,
      data: {
        ...data,
        id: folderId,
      },
    })
    return { folder }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':folderId')
  async getFolderWithFiles(
    @Param('folderId', ParseIntPipe) folderId: number
  ): Promise<FolderGetRes> {
    const folder = await this.foldersService.folder({ id: folderId })
    if (!folder) {
      throw new NotFoundException('Folder not found')
    }

    const files = await this.filesService.getFolderFiles(folderId)
    return { folder: this.foldersService.serializeFolder(folder), files }
  }
}
