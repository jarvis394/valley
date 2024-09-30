import { Injectable } from '@nestjs/common'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '../../auth/auth.service'
import { ConfigService } from '../../config/config.service'

export type RequestWithJwtPayload = Request & {
  user: JwtPayload & {
    refreshToken: string
  }
}

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.JWT_KEY,
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim()
    return { ...payload, refreshToken }
  }
}

@Injectable()
export class JwtRefreshTokenAuthGuard extends AuthGuard('jwt-refresh') {}
