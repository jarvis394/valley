import { Module } from '@nestjs/common'
import { ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'
import { ConfigService } from '../config/config.service'

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ConfigService],
})
export class ProjectsModule {}
