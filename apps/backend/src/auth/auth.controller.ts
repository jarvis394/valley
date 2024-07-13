import {
  Controller,
  Post,
  UseGuards,
  Body,
  Request,
  Get,
  Req,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LocalAuthGuard } from './strategies/local.strategy'
import {
  JwtRefreshTokenAuthGuard,
  RequestWithJwtPayload,
} from './strategies/jwtRefreshToken.strategy'
import { JwtAuthGuard } from './strategies/jwt.strategy'
import { ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { UserLoginRes, UserRegisterRes } from '@app/shared'
import { LoginDto } from './dto/login.dto'

export interface RequestWithUser extends Request {
  user: {
    userId: User['id']
    email: User['email']
  }
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: RequestWithUser,
    @Body() _data: LoginDto
  ): Promise<UserLoginRes> {
    return await this.authService.login(req.user.userId, req.user.email)
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Request() req: RequestWithUser) {
    return await this.authService.logout(req.user.userId)
  }

  @Post('register')
  async register(
    @Body() { email, password }: RegisterDto
  ): Promise<UserRegisterRes> {
    return await this.authService.register({
      email,
      password,
    })
  }

  @UseGuards(JwtRefreshTokenAuthGuard)
  @Get('refresh')
  async refreshTokens(@Req() req: RequestWithJwtPayload) {
    const userId = Number(req.user.sub)
    const refreshToken = req.user.refreshToken
    return await this.authService.refreshTokens(userId, refreshToken)
  }
}
