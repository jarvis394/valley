import { HttpStatus, Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app/app.module'
import { ConfigService } from './config/config.service'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    bodyParser: true,
    abortOnError: false,
  })
  const config = app.get(ConfigService)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    })
  )
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  })

  app.use(cookieParser(config.JWT_KEY))

  await app.listen(config.PORT, '0.0.0.0')
  Logger.log(`🚀 Application is running on: http://localhost:${config.PORT}`)
}

bootstrap()
