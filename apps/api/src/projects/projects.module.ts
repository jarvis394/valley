import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ConfigService],
})
export class ProjectsModule {}
