import { Module } from '@nestjs/common'
import { TagController } from './tag.controller'
import { ConfigService } from '../config/config.service'
import { TagService } from './tag.service'

@Module({
  providers: [ConfigService, TagService],
  controllers: [TagController],
})
export class TagModule {}
