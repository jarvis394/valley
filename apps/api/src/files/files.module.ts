import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'

@Module({
  controllers: [FilesController],
  providers: [FilesService, ConfigService],
})
export class FilesModule {}
