import { Injectable } from '@nestjs/common'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt'
import { ConfigService } from '../../config/config.service'
import { RequestWithUser } from '../auth.controller'
import { AuthService, JwtPayload } from '../auth.service'
import { TusHookData } from '@valley/shared'

const extractJwtFromTusHookRequest: JwtFromRequestFunction<Request> = (req) => {
  const typedBody = req.body as unknown as Partial<TusHookData>
  const token =
    typedBody?.Event?.HTTPRequest?.Header?.Authorization?.[0]?.replace(
      'Bearer ',
      ''
    ) || null

  return token
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromTusHookRequest,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
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
