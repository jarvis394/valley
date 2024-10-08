import { HttpStatus, Logger, ValidationPipe } from '@nestjs/common'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app/app.module'
import { ConfigService } from './config/config.service'
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception.filter'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    bodyParser: true,
    abortOnError: false,
  })
  const config = app.get(ConfigService)
  const { httpAdapter } = app.get(HttpAdapterHost)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    })
  )
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  })

  app.use(cookieParser(config.JWT_KEY))

  await app.listen(config.API_PORT, '0.0.0.0')
  Logger.log(
    `🚀 Application is running on: http://localhost:${config.API_PORT}`
  )
}

bootstrap()
