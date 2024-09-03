import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { FoldersController } from './folders.controller'
import { ProjectsService } from '../projects/projects.service'
import { FilesService } from '../files/files.service'
import { FoldersService } from './folders.service'

@Module({
  controllers: [FoldersController],
  providers: [FoldersService, ProjectsService, FilesService, ConfigService],
})
export class FoldersModule {}
