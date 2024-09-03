import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'
import { FilesService } from '../files/files.service'
import { FoldersService } from '../folders/folders.service'
import { ProjectsService } from '../projects/projects.service'

@Module({
  controllers: [UploadController],
  providers: [
    UploadService,
    FoldersService,
    ProjectsService,
    FilesService,
    ConfigService,
  ],
})
export class UploadModule {}
