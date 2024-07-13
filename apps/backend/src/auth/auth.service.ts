import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '../config/config.service'
import { compare } from 'bcryptjs'
import { RequestWithUser } from './auth.controller'
import { User } from '@prisma/client'
import { UserLoginRes } from '@app/shared'

export interface JwtPayload {
  email: string
  sub: string
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService
  ) {}

  async updateRefreshToken(
    userId: User['id'],
    refreshToken: string
  ) {
    const hashedRefreshToken = await this.userService.hash(refreshToken)
    return await this.userService.updateUser({
      data: {
        refreshToken: hashedRefreshToken,
      },
      where: {
        id: userId,
      },
    })
  }

  async revokeRefreshToken(userId: User['id']) {
    await this.userService.updateUser({
      data: {
        refreshToken: null,
      },
      where: {
        id: userId,
      },
    })
  }

  async refreshTokens(userId: User['id'], refreshToken: string) {
    const user = await this.userService.user({ id: userId })

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied')
    }

    const refreshTokenMatches = await compare(refreshToken, user.refreshToken)
    if (!refreshTokenMatches) throw new ForbiddenException('Access denied')

    const tokens = await this.getTokens(user.id, user.email)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  async validateUser(
    email: string,
    password: string
  ): Promise<RequestWithUser['user']> {
    const user = await this.userService.login(email, password)

    return {
      userId: user.id,
      email: user.email,
    }
  }

  async login(userId: User['id'], email: User['email']): Promise<UserLoginRes> {
    const user = await this.userService.user({ id: userId })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const tokens = await this.getTokens(userId, email)
    const userWithRefreshToken = await this.updateRefreshToken(
      user.id,
      tokens.refreshToken
    )

    return {
      user: this.userService.serializeUser(userWithRefreshToken),
      tokens,
    }
  }

  async logout(userId: User['id']) {
    this.revokeRefreshToken(userId)
    return { ok: true }
  }

  async getTokens(id: User['id'], email: User['email']) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,
          email,
        },
        {
          secret: this.configService.JWT_KEY,
          expiresIn: this.configService.JWT_ACCESS_TOKEN_TTL,
        }
      ),
      this.jwtService.signAsync(
        {
          sub: id,
          email,
        },
        {
          secret: this.configService.JWT_KEY,
          expiresIn: this.configService.JWT_REFRESH_TOKEN_TTL,
        }
      ),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  async register(userData: Omit<User, 'id' | 'refreshToken'>) {
    const user = await this.userService.register(userData)
    const tokens = await this.getTokens(user.id, user.email)
    const userWithRefreshToken = await this.updateRefreshToken(
      user.id,
      tokens.refreshToken
    )

    return {
      user: this.userService.serializeUser(userWithRefreshToken),
      tokens,
    }
  }
}
