import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'
import { FoldersService } from '../folders/folders.service'
import { ProjectsService } from '../projects/projects.service'

@Module({
  controllers: [FilesController],
  providers: [FilesService, FoldersService, ProjectsService, ConfigService],
})
export class FilesModule {}
