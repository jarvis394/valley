import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { redisStore } from 'cache-manager-redis-yet'
import { PrismaModule } from 'nestjs-prisma'
import type { RedisClientOptions } from 'redis'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '../config/config.module'
import { ConfigService } from '../config/config.service'
import { FilesModule } from '../files/files.module'
import { ProjectsModule } from '../projects/projects.module'
import { UploadModule } from '../upload/upload.module'
import { UsersModule } from '../users/users.module'
import { AppController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
    UploadModule,
    FilesModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [ConfigService],
})
export class AppModule {}
