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
import {
  FoldersServiceCommands,
  type FolderCreateReq,
  type FolderCreateRes,
  type FolderDeleteRes,
  type FolderEditReq,
  type FolderEditRes,
  type FolderGetRes,
} from '@valley/shared'
import { FoldersService } from './folders.service'
import { MessagePattern, Payload } from '@nestjs/microservices'

@Controller()
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService
    // private readonly filesService: FilesService
  ) {}

  // @MessagePattern(FoldersServiceCommands.CREATE_FOLDER)
  // async createFolder(
  //   @Payload() data: CreateFolderDto
  // ): Promise<FolderCreateRes> {
  //   const folder = await this.foldersService.createProjectFolder(data)
  //   return { folder, files: [] }
  // }

  // @Post(':folderId/edit')
  // async editFolder(
  //   // @Param('projectId', ParseIntPipe) projectId: number,
  //   // @Param('folderId', ParseIntPipe) folderId: number,
  //   // @Body() data: FolderEditReq,
  //   // @Req() req: RequestWithUser
  //   @Payload() data: CreateFolderDto
  // ): Promise<FolderEditRes> {
  //   const folder = await this.foldersService.editProjectFolder({
  //     userId: req.user.userId,
  //     projectId,
  //     data: {
  //       ...data,
  //       id: folderId,
  //     },
  //   })
  //   return { folder }
  // }

  // @Get(':folderId')
  // async getFolderWithFiles(
  //   @Param('projectId', ParseIntPipe) projectId: number,
  //   @Param('folderId', ParseIntPipe) folderId: number,
  //   @Req() req: RequestWithUser
  // ): Promise<FolderGetRes> {
  //   const folder = await this.foldersService.getProjectFolder({
  //     projectId,
  //     folderId,
  //     userId: req.user.userId,
  //   })
  //   const files = await this.filesService.getFolderFiles(folderId)

  //   return { folder, files }
  // }

  // @Delete(':folderId/delete')
  // async deleteProjectFolder(
  //   @Param('projectId', ParseIntPipe) projectId: number,
  //   @Param('folderId', ParseIntPipe) folderId: number,
  //   @Req() req: RequestWithUser
  // ): Promise<FolderDeleteRes> {
  //   await this.foldersService.getProjectFolder({
  //     projectId,
  //     folderId,
  //     userId: req.user.userId,
  //   })

  //   const files = await this.filesService.getFolderFiles(folderId)
  //   const deleteFilesResult = await this.filesService.deleteFiles(
  //     folderId,
  //     files
  //   )
  //   await this.foldersService.deleteFolder({ id: folderId })

  //   return { ...deleteFilesResult, ok: deleteFilesResult.errors.length === 0 }
  // }
}
