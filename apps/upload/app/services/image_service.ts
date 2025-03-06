import dec2frac from '#utils/dec2frac'
import drive from '@adonisjs/drive/services/main'
import { Readable } from 'node:stream'
import sharp from 'sharp'
import logger from '@adonisjs/core/services/logger'
import exifReader, { GenericTag } from 'exif-reader'

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

type ImageMetadata = {
  width?: number
  height?: number
}
type ExifData = Partial<Record<ExifDataKey, GenericTag | Date>>
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

export default class ImageService {
  async reader(input: Readable, offset?: number, length?: number) {
    const chunks = []

    for await (const chunk of input) {
      const buffer = Buffer.from(chunk)

      if (length && offset && buffer.length >= offset + length) {
        break
      }

      chunks.push(buffer)
    }

    return Buffer.concat(chunks)
  }

  /**
   * Extracts EXIF from S3 object (supports RAW, JPEG, WEBP and PNG formats)
   * And gets width/height of an image from metadata
   * @returns Parsed data
   */
  async parseImage(filePath: string): Promise<ImageParsedData> {
    const disk = drive.use()
    let exifParsedData: ExifParsedData = {
      ok: false,
      reason: 'Internal parsing error',
    }
    let metadataParsedData: MetadataParsedData = {
      ok: false,
      reason: 'Internal parsing error',
    }

    try {
      const data = await disk.getStream(filePath)
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

          if (value) {
            exifParsedData.data[typedKey] = value
          }
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`Image parsing error (${filePath}): ${e.message}`)
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
