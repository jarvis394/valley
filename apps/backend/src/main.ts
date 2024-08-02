import { Logger, ValidationPipe } from '@nestjs/common'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { ConfigService } from './config/config.service'
import { NestExpressApplication } from '@nestjs/platform-express'
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    bodyParser: true,
    abortOnError: false,
  })
  const config = app.get(ConfigService)
  const { httpAdapter } = app.get(HttpAdapterHost)

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
  app.enableCors({
    origin: '*',
  })

  await app.listen(config.PORT)
  Logger.log(`🚀 Application is running on: http://localhost:${config.PORT}`)
}

bootstrap()
