import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'
import { FilesService } from 'src/files/files.service'
import { ProjectsService } from 'src/projects/projects.service'
import { FoldersService } from 'src/folders/folders.service'

@Module({
  controllers: [UploadController],
  providers: [
    ProjectsService,
    FoldersService,
    UploadService,
    FilesService,
    ConfigService,
  ],
})
export class UploadModule {}
