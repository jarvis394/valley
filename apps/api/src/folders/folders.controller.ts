import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import type {
  FolderCreateReq,
  FolderCreateRes,
  FolderDeleteRes,
  FolderEditReq,
  FolderEditRes,
  FolderGetRes,
} from '@valley/shared'
import { FoldersService } from './folders.service'
import { FilesService } from '../files/files.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import type { RequestWithUser } from '../auth/auth.controller'

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
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Req() req: RequestWithUser
  ): Promise<FolderGetRes> {
    const { folder } = await this.foldersService.assertFolderExists({
      projectId,
      folderId,
      userId: req.user.userId,
    })
    const files = await this.filesService.getFolderFiles(folderId)

    return { folder, files }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':folderId/delete')
  async deleteProjectFolder(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Req() req: RequestWithUser
  ): Promise<FolderDeleteRes> {
    await this.foldersService.assertFolderExists({
      projectId,
      folderId,
      userId: req.user.userId,
    })

    const files = await this.filesService.getFolderFiles(folderId)
    const deleteFilesResult = await this.filesService.deleteFiles(
      folderId,
      files
    )
    await this.foldersService.deleteFolder({ id: folderId })

    return { ...deleteFilesResult, ok: deleteFilesResult.errors.length === 0 }
  }
}
