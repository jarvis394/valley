import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { UserLoginRes } from '@valley/shared'
import { compare } from 'bcryptjs'
import { ConfigService } from '../config/config.service'
import { UsersService } from '../users/users.service'
import { RequestWithUser } from './auth.controller'

export interface JwtPayload {
  username: string
  sub: string
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService
  ) {}

  async updateRefreshToken(userId: User['id'], refreshToken: string) {
    const hashedRefreshToken = await this.usersService.hash(refreshToken)
    return await this.usersService.updateUser({
      data: {
        refreshToken: hashedRefreshToken,
      },
      where: {
        id: userId,
      },
    })
  }

  async revokeRefreshToken(userId: User['id']) {
    await this.usersService.updateUser({
      data: {
        refreshToken: null,
      },
      where: {
        id: userId,
      },
    })
  }

  async refreshTokens(userId: User['id'], refreshToken: string) {
    const user = await this.usersService.user({ id: userId })

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied')
    }

    const refreshTokenMatches = await compare(refreshToken, user.refreshToken)
    if (!refreshTokenMatches) throw new ForbiddenException('Access denied')

    const tokens = await this.getTokens(user.id, user.username)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  async validateToken(payload: JwtPayload): Promise<RequestWithUser['user']> {
    try {
      const user = await this.usersService.user({ id: Number(payload.sub) })
      if (!user) {
        throw new Error('User not found')
      }

      return {
        username: user.username,
        userId: user.id,
      }
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid credentials, id was not found: ${payload.sub}`
      )
    }
  }

  async validateUser(
    username: string,
    password: string
  ): Promise<RequestWithUser['user']> {
    try {
      const user = await this.usersService.login(username, password)
      return {
        userId: user.id,
        username: user.username,
      }
    } catch (e) {
      throw new UnauthorizedException('Invalid credentials')
    }
  }

  async login(
    userId: User['id'],
    username: User['username']
  ): Promise<UserLoginRes> {
    const user = await this.usersService.user({ id: userId })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const tokens = await this.getTokens(userId, username)
    const userWithRefreshToken = await this.updateRefreshToken(
      user.id,
      tokens.refreshToken
    )

    return {
      user: this.usersService.serializeUser(userWithRefreshToken),
      tokens,
    }
  }

  async logout(userId: User['id']) {
    this.revokeRefreshToken(userId)
    return { ok: true }
  }

  async getTokens(id: User['id'], username: User['username']) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,
          username,
        },
        {
          secret: this.configService.JWT_KEY,
          expiresIn: this.configService.JWT_ACCESS_TOKEN_TTL,
        }
      ),
      this.jwtService.signAsync(
        {
          sub: id,
          username,
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
    const user = await this.usersService.register(userData)
    const tokens = await this.getTokens(user.id, user.username)
    const userWithRefreshToken = await this.updateRefreshToken(
      user.id,
      tokens.refreshToken
    )

    return {
      user: this.usersService.serializeUser(userWithRefreshToken),
      tokens,
    }
  }
}
