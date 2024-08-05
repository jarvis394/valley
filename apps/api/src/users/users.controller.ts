import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { UserGetSelfRes } from '@valley/shared'
import type { RequestWithUser } from '../auth/auth.controller'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getSelf(@Request() req: RequestWithUser): Promise<UserGetSelfRes> {
    const user = await this.userService.getSelf(req.user.userId)
    return { user }
  }
}
