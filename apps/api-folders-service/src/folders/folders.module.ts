import { Module } from '@nestjs/common'
import { ConfigService } from '../config/config.service'
import { FoldersController } from './folders.controller'
import { FoldersService } from './folders.service'

@Module({
  controllers: [FoldersController],
  providers: [FoldersService, ConfigService],
})
export class FoldersModule {}
