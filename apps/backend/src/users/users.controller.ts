import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { RequestWithUser } from '../auth/auth.controller'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { UserGetSelfRes } from '@valley/shared'

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
