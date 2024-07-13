import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common'
import { UserService } from './user.service'
import { RequestWithUser } from '../auth/auth.controller'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { UserGetSelfRes } from '@app/shared'

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  async getSelf(@Request() req: RequestWithUser): Promise<UserGetSelfRes> {
    const user = await this.userService.getSelf(req.user.userId)
    return { user }
  }

  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  @ApiBearerAuth()
  async getByEmail(@Param('email') email: string): Promise<UserGetSelfRes> {
    const user = await this.userService.getByEmail(email)
    return { user }
  }
}
