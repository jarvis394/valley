import { Module } from '@nestjs/common'
import { ConfigModule as BaseConfigModule } from '@nestjs/config'
import { ConfigService } from './config.service'

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends BaseConfigModule {}
