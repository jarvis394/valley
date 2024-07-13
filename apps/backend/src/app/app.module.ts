import { Logger, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '../config/config.module'
import { NoteModule } from '../note/note.module'
import { TagModule } from '../tag/tag.module'
import { PrismaModule, loggingMiddleware } from 'nestjs-prisma'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [
          loggingMiddleware({
            logger: new Logger('PrismaMiddleware'),
            logLevel: 'log',
          }),
        ],
      },
    }),
    UserModule,
    NoteModule,
    TagModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
