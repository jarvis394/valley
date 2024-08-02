import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy, AuthGuard } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '../../config/config.service'
import { JwtPayload } from '../auth.service'
import { RequestWithUser } from '../auth.controller'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.JWT_KEY,
    })
  }

  async validate(payload: JwtPayload): Promise<RequestWithUser['user']> {
    return { userId: Number(payload.sub), username: payload.username }
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
