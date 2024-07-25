import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ConfigModule } from '../config/config.module'
import { PrismaModule } from 'nestjs-prisma'
import { ConfigService } from '../config/config.service'
import { UploadModule } from '../upload/upload.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    UploadModule,
  ],
  controllers: [AppController],
  providers: [ConfigService],
})
export class AppModule {}
