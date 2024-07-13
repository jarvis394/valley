import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  override catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost
  ) {
    const response = host.switchToHttp().getResponse()
    const status = HttpStatus.BAD_REQUEST

    response.status(status).json({
      error: true,
      code: status,
      message: exception.message,
    })
  }
}
