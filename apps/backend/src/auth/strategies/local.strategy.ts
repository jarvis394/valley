import { Strategy } from 'passport-local'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { RequestWithUser } from '../auth.controller'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
    })
  }

  async validate(
    username: string,
    password: string
  ): Promise<RequestWithUser['user']> {
    try {
      const user = await this.authService.validateUser(username, password)
      return user
    } catch (e) {
      throw new HttpException('Invalid credentials', HttpStatus.FORBIDDEN)
    }
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
