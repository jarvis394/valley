import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'
import { ConfigService } from '../config/config.service'

@Module({
  controllers: [FilesController],
  providers: [FilesService, ConfigService],
})
export class FilesModule {}
