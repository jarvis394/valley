import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { ConfigService } from './config/config.service'
import { NestExpressApplication } from '@nestjs/platform-express'
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception.filter'
import { Request } from 'express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    bodyParser: true,
    abortOnError: false,
  })
  const config = app.get(ConfigService)
  const { httpAdapter } = app.get(HttpAdapterHost)

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
  app.enableCors({
    origin: '*',
  })

  app.useBodyParser('raw', {
    type: (req: Request) => {
      return req.headers['content-type'] === 'application/binary'
    },
    limit: '1GB',
  })

  await app.listen(config.PORT)
  Logger.log(`🚀 Application is running on: http://localhost:${config.PORT}`)
}

bootstrap()
