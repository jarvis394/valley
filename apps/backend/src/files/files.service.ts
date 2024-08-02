import { Inject, Injectable, Logger } from '@nestjs/common'
import exifr from 'exifr'
import dec2frac from '../utils/dec2frac'
import { ConfigService } from '../config/config.service'
import { PrismaService } from 'nestjs-prisma'
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import sharp from 'sharp'

@Injectable()
export class FilesService {
  static UPLOAD_BUCKET = 'files'
  static THUMBNAIL_ALLOWED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpg',
    'image/jpeg',
  ])

  private logger = new Logger('UploadService')
  readonly storage: S3Client

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    this.storage = new S3Client({
      endpoint: configService.AWS_ENDPOINT,
      region: configService.AWS_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: configService.AWS_ACCESS_KEY_ID,
        secretAccessKey: configService.AWS_SECRET_ACCESS_KEY,
      },
    })
  }
}
