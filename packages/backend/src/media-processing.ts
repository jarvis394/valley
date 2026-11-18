import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { writeBodyToFile, type Storage } from '@valley/storage'
import sharp from 'sharp'

/** Long edge of the rendition the canvas shows. Originals stay untouched for downloads. */
const PREVIEW_EDGE = 2560
const PREVIEW_QUALITY = 82

/** Formats browsers show as they are; a small file in one of them needs no preview. */
const WEB_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
])

export interface ProcessedMedia {
  width: number
  height: number
  previewKey: string | null
}

export const previewKeyFor = (originalKey: string) =>
  `${originalKey.replace('/originals/', '/previews/').replace(/\.[^./]+$/, '')}.webp`

/** Copies a stored object to a temporary file, so sharp reads it from disk instead of memory. */
async function withLocalCopy<T>(storage: Storage, key: string, use: (file: string) => Promise<T>) {
  const object = await storage.read(key)
  if (!object) throw new Error(`Uploaded object ${key} is missing`)

  const directory = await mkdtemp(path.join(tmpdir(), 'valley-'))
  const file = path.join(directory, 'original')

  try {
    await writeBodyToFile(object.body, file)

    return await use(file)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

/**
 * Measures an uploaded image and writes its web preview. Falls back to the client's
 * measurements when sharp can't decode the format (RAW, HEIC without libheif).
 */
export async function processImage(
  storage: Storage,
  key: string,
  { contentType, fallback }: { contentType: string; fallback: { width: number; height: number } },
): Promise<ProcessedMedia> {
  return withLocalCopy(storage, key, async (file) => {
    try {
      const metadata = await sharp(file, { failOn: 'none' }).metadata()
      const { width, height } = metadata.autoOrient
      const webType = WEB_IMAGE_TYPES.has(contentType)
      const needsPreview =
        !webType || Math.max(width, height) > PREVIEW_EDGE || (metadata.orientation ?? 1) > 1
      // A preview keeps only the first page, which would freeze an animated GIF or WebP.
      const animated = webType && (metadata.pages ?? 1) > 1
      if (!needsPreview || animated) return { width, height, previewKey: null }

      const preview = await sharp(file, { failOn: 'none' })
        .autoOrient()
        .resize({
          width: PREVIEW_EDGE,
          height: PREVIEW_EDGE,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: PREVIEW_QUALITY })
        .toBuffer({ resolveWithObject: true })
      const previewKey = previewKeyFor(key)
      await storage.write(previewKey, preview.data, { contentType: 'image/webp' })

      return { width, height, previewKey }
    } catch (error) {
      console.warn(`Could not process ${key}; showing the original`, error)

      return { ...fallback, previewKey: null }
    }
  })
}
