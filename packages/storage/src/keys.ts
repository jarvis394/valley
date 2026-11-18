import { StorageError } from './types'

/** Rejects keys that could escape the storage root or address a directory. */
export function assertKey(key: string) {
  const parts = key.split('/')
  const valid =
    key.length > 0 &&
    key.length <= 1024 &&
    !key.startsWith('/') &&
    !key.includes('\\') &&
    !key.includes('\0') &&
    parts.every((part) => part !== '' && part !== '.' && part !== '..')

  if (!valid) throw new StorageError(`Invalid storage key: ${JSON.stringify(key)}`, 'invalid-key')

  return key
}

const CONTENT_TYPES: Record<string, string> = {
  arw: 'image/x-sony-arw',
  avif: 'image/avif',
  cr2: 'image/x-canon-cr2',
  cr3: 'image/x-canon-cr3',
  dng: 'image/x-adobe-dng',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  nef: 'image/x-nikon-nef',
  orf: 'image/x-olympus-orf',
  png: 'image/png',
  raf: 'image/x-fuji-raf',
  rw2: 'image/x-panasonic-rw2',
  svg: 'image/svg+xml',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  webp: 'image/webp',
  m4v: 'video/mp4',
  mkv: 'video/x-matroska',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  webm: 'video/webm',
  json: 'application/json',
}

export function contentTypeFor(key: string) {
  const extension = key.slice(key.lastIndexOf('.') + 1).toLowerCase()

  return CONTENT_TYPES[extension] ?? 'application/octet-stream'
}

export const joinUrl = (base: string, key: string) =>
  `${base.replace(/\/+$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`
