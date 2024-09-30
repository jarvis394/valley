import { Injectable } from '@nestjs/common'
import { ConfigService as BaseConfigService } from '@nestjs/config'

type EnvSchema = {
  PORT: string
  JWT_KEY: string
  JWT_REFRESH_TOKEN_TTL: string
  JWT_ACCESS_TOKEN_TTL: string
  DATABASE_URL: string
  AWS_ENDPOINT: string
  AWS_REGION: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  CACHE_TTL: string
  REDIS_URL: string
  REDIS_KEY_PREFIX: string
  UPLOAD_BUCKET: string
}

@Injectable()
export class ConfigService {
  constructor(private configService: BaseConfigService<EnvSchema>) {}

  get UPLOAD_CONTEXT_TTL() {
    return 60 * 60 * 1000 // 1 hour
  }

  get PORT() {
    return Number(this.configService.get<string>('PORT')) || 5000
  }

  get JWT_KEY() {
    return this.configService.getOrThrow<string>('JWT_KEY')
  }

  get JWT_REFRESH_TOKEN_TTL() {
    return this.configService.get<string>('JWT_REFRESH_TOKEN_TTL') || '30d'
  }

  get JWT_ACCESS_TOKEN_TTL() {
    return this.configService.get<string>('JWT_ACCESS_TOKEN_TTL') || '1d'
  }

  get DATABASE_URL() {
    return this.configService.getOrThrow<string>('DATABASE_URL')
  }

  get AWS_ENDPOINT() {
    return this.configService.getOrThrow<string>('AWS_ENDPOINT')
  }

  get AWS_REGION() {
    return this.configService.getOrThrow<string>('AWS_REGION')
  }

  get AWS_ACCESS_KEY_ID() {
    return this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID')
  }

  get AWS_SECRET_ACCESS_KEY() {
    return this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY')
  }

  /** Cache data TTL in milliseconds */
  get CACHE_TTL() {
    return Number(this.configService.get('CACHE_TTL')) || 60 * 60 * 24 * 1000 // 1 day
  }

  get REDIS_URL() {
    return this.configService.getOrThrow<string>('REDIS_URL')
  }

  get REDIS_KEY_PREFIX() {
    return this.configService.get<string>('REDIS_KEY_PREFIX') || 'valley'
  }

  get UPLOAD_BUCKET() {
    return this.configService.get<string>('UPLOAD_BUCKET') || 'files'
  }
}
