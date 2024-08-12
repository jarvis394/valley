import { Injectable } from '@nestjs/common'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '../../config/config.service'
import { RequestWithUser } from '../auth.controller'
import { AuthService, JwtPayload } from '../auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.JWT_KEY,
    })
  }

  async validate(payload: JwtPayload): Promise<RequestWithUser['user']> {
    return await this.authService.validateToken(payload)
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
