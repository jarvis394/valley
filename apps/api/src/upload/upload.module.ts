import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'

@Module({
  controllers: [UploadController],
  providers: [UploadService, ConfigService],
})
export class UploadModule {}
