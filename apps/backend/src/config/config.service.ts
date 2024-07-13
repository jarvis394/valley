import { Injectable } from '@nestjs/common'
import { ConfigService as BaseConfigService } from '@nestjs/config'

type EnvSchema = {
  PORT: string
  DATABASE_URL: string
  JWT_KEY: string
  JWT_ACCESS_TOKEN_TTL: string
  JWT_REFRESH_TOKEN_TTL: string
}

@Injectable()
export class ConfigService {
  constructor(private configService: BaseConfigService<EnvSchema>) {}

  get PORT() {
    return this.configService.get('PORT') || 5000
  }

  get DATABASE_URL() {
    return this.configService.getOrThrow('DATABASE_URL')
  }

  get JWT_KEY() {
    return this.configService.getOrThrow('JWT_KEY')
  }

  get JWT_ACCESS_TOKEN_TTL() {
    return this.configService.get('JWT_ACCESS_TOKEN_TTL') || '60m'
  }

  get JWT_REFRESH_TOKEN_TTL() {
    return this.configService.get('JWT_REFRESH_TOKEN_TTL') || '30d'
  }
}
