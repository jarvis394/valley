import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { ProjectsService } from 'src/projects/projects.service'

@Module({
  controllers: [UsersController],
  providers: [UsersService, ProjectsService, ConfigService],
  exports: [UsersService],
})
export class UsersModule {}
