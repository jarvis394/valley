import { Module } from '@nestjs/common'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'
import { ConfigService } from '../config/config.service'

@Module({
  controllers: [UploadController],
  providers: [UploadService, ConfigService],
})
export class UploadModule {}
