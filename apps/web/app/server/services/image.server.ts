import { ExifData, ExifDataKey } from '@valley/db'
import { dec2frac } from '../../utils/misc'
import sharp from 'sharp'
import exifReader from 'exif-reader'
import { disk, DRIVE_DISK, s3Client } from './drive.server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { IncomingMessage } from 'node:http'

type ImageMetadata = {
  width?: number
  height?: number
}
type ExifParsedData =
  | { ok: true; data: ExifData }
  | { ok: false; reason: string }
type MetadataParsedData =
  | { ok: true; data: ImageMetadata }
  | { ok: false; reason: string }
type ImageParsedData = { exif: ExifParsedData; metadata: MetadataParsedData }

const extractFields: Set<ExifDataKey> = new Set([
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

export class ImageService {
  // TODO: implement for GCS and local
  static async fetchFileRange(filePath: string) {
    if (DRIVE_DISK === 's3') {
      const command = new GetObjectCommand({
        Key: filePath,
        Bucket: process.env.AWS_BUCKET!,
        Range: 'bytes=0-1000000',
      })
      const res = await s3Client.send(command)
      return res?.Body as IncomingMessage
    } else {
      return await disk.getStream(filePath)
    }
  }

  /**
   * Extracts EXIF from S3 object (supports RAW, JPEG, WEBP and PNG formats)
   * And gets width/height of an image from metadata
   * @returns Parsed data
   */
  static async parseImage(filePath: string): Promise<ImageParsedData> {
    let exifParsedData: ExifParsedData = {
      ok: false,
      reason: 'Internal parsing error',
    }
    let metadataParsedData: MetadataParsedData = {
      ok: false,
      reason: 'Internal parsing error',
    }

    try {
      const data = await ImageService.fetchFileRange(filePath)
      const image = sharp()
      data.pipe(image)
      const metadata = await image.metadata()

      if (metadata.width && metadata.height) {
        metadataParsedData = {
          ok: true,
          data: {
            width: metadata.width,
            height: metadata.height,
          },
        }
      }

      exifParsedData = { ok: true, data: {} }

      if (metadata.exif) {
        const parsedExif = exifReader(metadata.exif)
        const combinedExif = { ...parsedExif.Image, ...parsedExif.Photo }

        for (const key of Object.keys(combinedExif)) {
          const typedKey = key as ExifDataKey
          let value = combinedExif[typedKey]

          if (!extractFields.has(typedKey)) {
            continue
          }

          // Transform shutter speed to a fraction
          if (key === 'ExposureTime' && typeof value === 'number') {
            value = dec2frac(value)
          }

          // Shorten numbers to 3 digits
          if (typeof value === 'number') {
            value = Math.round(value * 100) / 100
          }

          if (value && !Array.isArray(value) && !Buffer.isBuffer(value)) {
            exifParsedData.data[typedKey] = value
          }
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(`Image parsing error (${filePath}): ${e.message}`)
        exifParsedData = { ok: false, reason: e.message }
        metadataParsedData = { ok: false, reason: e.message }
      }
    }

    return {
      exif: exifParsedData,
      metadata: metadataParsedData,
    }
  }
}
