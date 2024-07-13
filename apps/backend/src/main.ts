import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { ConfigService } from './config/config.service'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService)
  const { httpAdapter } = app.get(HttpAdapterHost)
  const globalPrefix = 'api'

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix(globalPrefix)
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))

  const swaggerConfig = new DocumentBuilder()
    .setTitle('nestjs-prisma-boilerplate')
    .setDescription('Basic notes application, with tag support')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('user')
    .addTag('note')
    .addTag('tag')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  })
  SwaggerModule.setup('api', app, document)

  await app.listen(config.PORT)
  Logger.log(
    `🚀 Application is running on: http://localhost:${config.PORT}/${globalPrefix}`
  )
}

bootstrap()
