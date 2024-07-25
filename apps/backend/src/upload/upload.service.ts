import { Injectable } from '@nestjs/common'
import exifr from 'exifr'
import dec2frac from '../utils/dec2frac'

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

  // async uploadFileToS3(file: Express.Multer.File) {

  // }

  async processFiles(files: Express.Multer.File[]): Promise<ExifParsedData[]> {
    const exifPromises = files.map((file) => this.extractExifData(file.buffer))
    const filesExifData = await Promise.all(exifPromises)

    return filesExifData
  }
}
