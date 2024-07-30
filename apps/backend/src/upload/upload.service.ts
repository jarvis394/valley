import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import exifr from 'exifr'
import dec2frac from '../utils/dec2frac'
import {
  S3Client,
  UploadPartCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
} from '@aws-sdk/client-s3'
import { ConfigService } from '../config/config.service'
import { PrismaService } from 'nestjs-prisma'
import {
  FileMultipartUploadChunkReq,
  FileMultipartUploadChunkRes,
  FileMultipartUploadCompleteReq,
  FileMultipartUploadStartReq,
  FileMultipartUploadStartRes,
} from '@valley/shared'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import deburr from 'lodash.deburr'

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
  storage: S3Client

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    this.storage = new S3Client({
      endpoint: configService.S3_ENDPOINT,
      region: configService.S3_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: configService.S3_ACCESS_KEY,
        secretAccessKey: configService.S3_SECRET_ACCESS_KEY,
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

  async startMultipartUpload(
    data: FileMultipartUploadStartReq
  ): Promise<FileMultipartUploadStartRes> {
    const normalizedName = deburr(data.filename)
    const command = new CreateMultipartUploadCommand({
      Bucket: UploadService.UPLOAD_BUCKET,
      Key: normalizedName,
      ChecksumAlgorithm: 'CRC32',
    })
    const res = await this.storage.send(command)

    if (!res.UploadId) {
      throw new InternalServerErrorException('S3 did not return UploadId')
    }

    this.cacheManager.set(
      this.getUploadContextKey(res.UploadId),
      { filename: normalizedName },
      this.configService.UPLOAD_CONTEXT_TTL
    )

    return { uploadId: res.UploadId }
  }

  async completeMultipartUpload(data: FileMultipartUploadCompleteReq) {
    const command = new CompleteMultipartUploadCommand({
      Bucket: UploadService.UPLOAD_BUCKET,
      Key: data.filename,
      UploadId: data.uploadId,
      MultipartUpload: {
        Parts: data.parts,
      },
    })
    const res = await this.storage.send(command)

    return res
  }

  async uploadMultipartChunk(
    data: FileMultipartUploadChunkReq,
    chunk: Express.Multer.File
  ): Promise<FileMultipartUploadChunkRes> {
    const context = await this.getUploadContext(data.uploadId)

    if (!context) {
      throw new InternalServerErrorException(
        'Upload context is not found in store'
      )
    }

    const command = new UploadPartCommand({
      Bucket: UploadService.UPLOAD_BUCKET,
      Key: context.filename,
      Body: chunk.buffer,
      UploadId: data.uploadId,
      ChecksumAlgorithm: 'CRC32',
      PartNumber: Number(data.part),
    })
    const res = await this.storage.send(command)

    if (!res.ETag) {
      throw new InternalServerErrorException(
        'No ETag returned from S3 when uploading chunk'
      )
    }

    return {
      filename: context.filename,
      fileSize: data.fileSize,
      partSize: data.partSize,
      part: data.part,
      etag: res.ETag,
    }
  }
}
