import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'
import { FoldersService } from 'src/folders/folders.service'

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, FoldersService, ConfigService],
})
export class ProjectsModule {}
