import drive from '@adonisjs/drive/services/main'
import FileService from '#services/file_service'
import sharp from 'sharp'
import { Readable } from 'node:stream'
import env from '#start/env'
import { s3Client } from '#config/drive'
import { Upload } from '@aws-sdk/lib-storage'
import { MULTIPART_UPLOAD_CHUNK_SIZE } from '@valley/shared'

const defaultDriveProvider = env.get('DRIVE_DISK')

type ThumbnailCreationResult =
  | { ok: true; key: string }
  | { ok: false; reason: string }

export default class ThumbnailService {
  static readonly THUMBNAIL_WIDTH = 320
  static readonly THUMBNAIL_QUALITY = 100
  static readonly THUMBNAIL_ALLOWED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpg',
    'image/jpeg',
  ])

  constructor() {}

  async createFileThumbnail(
    filePath: string
  ): Promise<ThumbnailCreationResult> {
    const disk = drive.use()
    let data: Readable

    try {
      data = await disk.getStream(filePath)
    } catch (e) {
      if (e instanceof Error) {
        return { ok: false, reason: e.message }
      } else {
        return { ok: false, reason: 'Internal parsing error' }
      }
    }

    const thumbnailKey = FileService.makeThumbnailUploadPath(filePath)
    const pipeline = sharp()
      .withMetadata()
      .resize({
        fit: sharp.fit.contain,
        width: ThumbnailService.THUMBNAIL_WIDTH,
      })
      .jpeg({
        quality: ThumbnailService.THUMBNAIL_QUALITY,
      })

    if (defaultDriveProvider === 's3') {
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: env.get('UPLOAD_BUCKET'),
          Key: thumbnailKey,
          Body: pipeline,
        },
        queueSize: 4,
        partSize: MULTIPART_UPLOAD_CHUNK_SIZE,
      })

      data.pipe(pipeline)

      await upload.done()

      return { ok: true, key: thumbnailKey }
    }

    const stream = disk.putStream(thumbnailKey, pipeline)

    data.pipe(pipeline)

    return stream
      .then(() => {
        return { ok: true, key: thumbnailKey } as const
      })
      .catch((e) => {
        return { ok: false, reason: e.message }
      })
  }

  static shouldGenerateThumbnail(type: string) {
    return ThumbnailService.THUMBNAIL_ALLOWED_CONTENT_TYPES.has(type)
  }
}
