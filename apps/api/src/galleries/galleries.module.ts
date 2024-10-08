import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { GalleriesController } from './galleries.controller'
import { GalleriesService } from './galleries.service'
import { ProjectsService } from '../projects/projects.service'
import { FoldersService } from '../folders/folders.service'

@Module({
  controllers: [GalleriesController],
  providers: [GalleriesService, ProjectsService, FoldersService, ConfigService],
})
export class GalleriesModule {}
