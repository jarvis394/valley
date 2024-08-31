import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { FoldersController } from './folders.controller'
import { FoldersService } from './folders.service'
import { FilesService } from 'src/files/files.service'
import { ProjectsService } from 'src/projects/projects.service'

@Module({
  controllers: [FoldersController],
  providers: [FoldersService, ProjectsService, FilesService, ConfigService],
})
export class FoldersModule {}
