import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserModule } from '../user/user.module'
import { LocalStrategy } from './strategies/local.strategy'
import { PassportModule } from '@nestjs/passport'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { AuthController } from './auth.controller'
import { ConfigService } from '../config/config.service'
import { ConfigModule } from '../config/config.module'
import { JwtRefreshTokenStrategy } from './strategies/jwtRefreshToken.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secretOrPrivateKey: configService.JWT_KEY,
        signOptions: {
          expiresIn: configService.JWT_ACCESS_TOKEN_TTL,
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    ConfigService,
    UserService,
    JwtService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
