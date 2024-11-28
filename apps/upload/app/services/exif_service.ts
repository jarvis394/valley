import exifr from '@laosb/exifr'
import dec2frac from '#utils/dec2frac'
import drive from '@adonisjs/drive/services/main'
import { Readable } from 'node:stream'

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
  | { ok: true; data: ExifData }
  | { ok: false; reason: string }

const extractFields: ExifDataKey[] = [
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
]

export default class ExifService {
  static readonly EXIF_PARSING_OPTIONS = {
    pick: extractFields,
  }

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
   * @returns Parsed EXIF data
   */
  async extractExifData(filePath: string): Promise<ExifParsedData> {
    const disk = drive.use()
    let parsedExif: ExifData | null

    try {
      const data = await disk.getStream(filePath)
      parsedExif = await exifr.parse(data, {
        ...ExifService.EXIF_PARSING_OPTIONS,
        externalReader: this.reader.bind(this),
      })
    } catch (e) {
      if (e instanceof Error) {
        return { ok: false, reason: e.message }
      } else {
        return { ok: false, reason: 'Internal parsing error' }
      }
    }

    if (!parsedExif) {
      return { ok: false, reason: 'Parsed EXIF is empty' }
    }

    const res: ExifParsedData = { ok: true, data: {} }

    for (const key of Object.keys(parsedExif)) {
      const typedKey = key as ExifDataKey
      let value = parsedExif[typedKey]

      // Transform shutter speed to a fraction
      if (key === 'ExposureTime' && typeof value === 'number') {
        value = dec2frac(value)
      }

      // Shorten numbers to 3 digits
      if (typeof value === 'number') {
        value = Math.round(value * 100) / 100
      }

      if (value) {
        res.data[typedKey] = value
      }
    }

    return res
  }
}
