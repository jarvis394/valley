import { Injectable } from '@nestjs/common'
import { ConfigService as BaseConfigService } from '@nestjs/config'

type EnvSchema = {
  PORT: string
  DATABASE_URL: string
  S3_ENDPOINT: string
  S3_REGION: string
  S3_ACCESS_KEY: string
  S3_SECRET_ACCESS_KEY: string
  CACHE_TTL: string
  REDIS_URL: string
  REDIS_KEY_PREFIX: string
}

@Injectable()
export class ConfigService {
  constructor(private configService: BaseConfigService<EnvSchema>) {}

  get UPLOAD_CONTEXT_TTL() {
    return 60 * 60 * 1000 // 1 hour
  }

  get PORT() {
    return this.configService.get('PORT') || 5000
  }

  get DATABASE_URL() {
    return this.configService.getOrThrow('DATABASE_URL')
  }

  get S3_ENDPOINT() {
    return this.configService.getOrThrow('S3_ENDPOINT')
  }

  get S3_REGION() {
    return this.configService.getOrThrow('S3_REGION')
  }

  get S3_ACCESS_KEY() {
    return this.configService.getOrThrow('S3_ACCESS_KEY')
  }

  get S3_SECRET_ACCESS_KEY() {
    return this.configService.getOrThrow('S3_SECRET_ACCESS_KEY')
  }

  /** Cache data TTL in milliseconds */
  get CACHE_TTL() {
    return Number(this.configService.get('CACHE_TTL')) || 60 * 60 * 24 * 1000 // 1 day
  }

  get REDIS_URL() {
    return this.configService.getOrThrow('REDIS_URL')
  }

  get REDIS_KEY_PREFIX() {
    return this.configService.get('REDIS_KEY_PREFIX') || 'valley'
  }
}
