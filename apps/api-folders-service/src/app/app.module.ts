import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { redisStore } from 'cache-manager-redis-yet'
import { PrismaModule } from 'nestjs-prisma'
import type { RedisClientOptions } from 'redis'
import { ConfigModule } from '../config/config.module'
import { ConfigService } from '../config/config.service'
import { AppController } from './app.controller'
import { FoldersModule } from '../folders/folders.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Imports root .env file and local apps/api .env file
      envFilePath: ['../../.env', './.env'],
    }),
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      inject: [ConfigService],
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          ttl: configService.CACHE_TTL,
          keyPrefix: configService.REDIS_KEY_PREFIX,
          url: configService.REDIS_URL,
        }),
      }),
    }),
    FoldersModule,
  ],
  controllers: [AppController],
  providers: [ConfigService],
})
export class AppModule {}
