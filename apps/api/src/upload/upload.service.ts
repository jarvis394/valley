import { Readable } from 'node:stream'
import { buffer } from 'node:stream/consumers'
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import exifr from 'exifr'
import { PrismaService } from 'nestjs-prisma'
import sharp from 'sharp'
import { ConfigService } from '../config/config.service'
import dec2frac from '../utils/dec2frac'
import { TusHookData } from './upload.controller'

type UploadContext = {
  filename: string
}

type ExifDataKey =
  | 'Artist'
  | 'Copyright'
  | 'DateTimeOriginal'
  | 'Make'
  | 'Model'
  | 'LensModel'
  | 'ExifImageWidth'
  | 'ExifImageHeight'
  | 'ExposureTime'
  | 'ISO'
  | 'FocalLength'
  | 'ApertureValue'
  | 'GPSLatitude'
  | 'GPSLongitude'
  | 'Flash'
  | 'FNumber'
  | 'Orientation'

type ExifData = Partial<Record<ExifDataKey, string | number>>
type ExifParsedData =
  | (ExifData & { parsed: true })
  | { parsed: false; reason: string }

const extractFields = new Set<ExifDataKey>([
  'Artist',
  'Copyright',
  'DateTimeOriginal',
  'Make',
  'Model',
  'LensModel',
  'ExifImageWidth',
  'ExifImageHeight',
  'ExposureTime',
  'ISO',
  'FocalLength',
  'ApertureValue',
  'GPSLatitude',
  'GPSLongitude',
  'Flash',
  'FNumber',
  'Orientation',
])

@Injectable()
export class UploadService {
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

  /**
   * Extracts EXIF from image/file (supports RAW, JPEG, WEBP and PNG formats)
   * @param buffer Image binary data
   * @returns Parsed EXIF data
   */
  async extractExifData(buffer: Buffer): Promise<ExifParsedData> {
    let parsedExif: ExifData
    try {
      parsedExif = await exifr.parse(buffer)
    } catch (e) {
      if (e instanceof Error) {
        return { parsed: false, reason: e.message }
      } else {
        return { parsed: false, reason: 'Internal parsing error' }
      }
    }

    const res: ExifParsedData = { parsed: true }

    for (const key of Object.keys(parsedExif)) {
      const typedKey = key as ExifDataKey

      if (extractFields.has(typedKey)) {
        let value = parsedExif[typedKey]

        // Transform shutter speed to a fraction
        if (key === 'ExposureTime' && typeof value === 'number') {
          value = dec2frac(value)
        }

        // Shorten numbers to 3 digits
        if (typeof value == 'number') {
          value = Math.round(value * 100) / 100
        }

        if (value) {
          res[typedKey] = value
        }
      }
    }

    return res
  }

  getUploadContextKey(uploadId: string) {
    return 'upload_' + uploadId
  }

  async getUploadContext(uploadId: string) {
    return await this.cacheManager.get<UploadContext>(
      this.getUploadContextKey(uploadId)
    )
  }

  async generateThumbnail(upload: TusHookData['Event']['Upload']) {
    const getObjectCommand = new GetObjectCommand({
      Bucket: upload.Storage.Bucket,
      Key: upload.Storage.Key,
    })
    const object = await this.storage.send(getObjectCommand)

    if (object.Body instanceof Readable) {
      const fileBuffer = await buffer(object.Body)
      const imageBuffer = await sharp(fileBuffer)
        .resize({
          fit: sharp.fit.contain,
          width: 320,
        })
        .jpeg({
          quality: 70,
        })
        .toBuffer()

      const putObjectCommand = new PutObjectCommand({
        Bucket: upload.Storage.Bucket,
        Key: upload.Storage.Key + '_320w',
        Body: imageBuffer,
      })
      await this.storage.send(putObjectCommand)
    }

    return upload.Storage.Key + '_320w'
  }

  async finalizeUpload(event: TusHookData['Event']) {
    const contentType = event.Upload.MetaData.type
    const shouldGenerateThumbnail =
      UploadService.THUMBNAIL_ALLOWED_CONTENT_TYPES.has(contentType)
    const res: { thumbnailKey?: string; originalKey: string } = {
      originalKey: event.Upload.Storage.Key,
    }

    if (shouldGenerateThumbnail) {
      const thumbnailKey = await this.generateThumbnail(event.Upload)
      res.thumbnailKey = thumbnailKey
    }
  }
}
