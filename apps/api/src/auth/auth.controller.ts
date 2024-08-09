import {
  Body,
  Controller,
  Get,
  Post,
  Response,
  Request,
  UseGuards,
  HttpCode,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { Tokens, UserLoginRes, UserRegisterRes } from '@valley/shared'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtAuthGuard } from './strategies/jwt.strategy'
import type { RequestWithJwtPayload } from './strategies/jwtRefreshToken.strategy'
import { JwtRefreshTokenAuthGuard } from './strategies/jwtRefreshToken.strategy'
import { LocalAuthGuard } from './strategies/local.strategy'
import type { Response as Res } from 'express'

export interface RequestWithUser extends Request {
  user: {
    userId: User['id']
    username: User['username']
  }
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(
    @Request() req: RequestWithUser,
    @Response() res: Res<UserLoginRes>,
    @Body() _data: LoginDto
  ): Promise<Res<UserLoginRes>> {
    const data = await this.authService.login(
      req.user.userId,
      req.user.username
    )

    return res
      .cookie('access-token', data.tokens.accessToken, { httpOnly: true })
      .cookie('refresh-token', data.tokens.refreshToken, { httpOnly: true })
      .json(data)
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Request() req: RequestWithUser) {
    return await this.authService.logout(req.user.userId)
  }

  @Post('register')
  async register(
    @Body() { username, password }: RegisterDto,
    @Response() res: Res<UserRegisterRes>
  ): Promise<Res<UserRegisterRes>> {
    const data = await this.authService.register({
      username,
      password,
    })

    return res
      .cookie('access-token', data.tokens.accessToken, { httpOnly: true })
      .cookie('refresh-token', data.tokens.refreshToken, { httpOnly: true })
      .json(data)
  }

  @UseGuards(JwtRefreshTokenAuthGuard)
  @Get('refresh')
  async refreshTokens(
    @Request() req: RequestWithJwtPayload,
    @Response() res: Res<Tokens>
  ): Promise<Res<Tokens>> {
    const userId = Number(req.user.sub)
    const refreshToken = req.user.refreshToken
    const data = await this.authService.refreshTokens(userId, refreshToken)

    return res
      .cookie('access-token', data.accessToken, { httpOnly: true })
      .cookie('refresh-token', data.refreshToken, { httpOnly: true })
      .json(data)
  }
}
