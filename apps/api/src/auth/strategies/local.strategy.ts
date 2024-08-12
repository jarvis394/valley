import { Injectable } from '@nestjs/common'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { RequestWithUser } from '../auth.controller'
import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
    })
  }

  async validate(
    username: string,
    password: string
  ): Promise<RequestWithUser['user']> {
    return await this.authService.validateUser(username, password)
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
