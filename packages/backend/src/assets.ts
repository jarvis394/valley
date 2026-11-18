import { assets, type Db, type NewAssetRow } from '@valley/db'
import type { Storage } from '@valley/storage'
import { customAlphabet } from 'nanoid'
import { processImage } from './media-processing'
import { storeRef } from './refs'

const assetId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16)

export interface StoredFile {
  projectId: string
  key: string
  name: string
  contentType: string
  size: number
  /** Measurements to keep when the server can't read the file itself. */
  fallback: { width: number; height: number }
}

/** Measures a stored file, writes its preview and records it as an asset of its project. */
export async function recordAsset(db: Db, storage: Storage, file: StoredFile) {
  const kind = file.contentType.startsWith('video/') ? 'video' : 'image'
  const media =
    kind === 'image'
      ? await processImage(storage, file.key, {
          contentType: file.contentType,
          fallback: file.fallback,
        })
      : { ...file.fallback, previewKey: null }
  const row = {
    id: assetId(),
    projectId: file.projectId,
    kind,
    name: file.name,
    contentType: file.contentType,
    size: file.size,
    width: media.width,
    height: media.height,
    originalKey: file.key,
    previewKey: media.previewKey,
  } satisfies NewAssetRow
  // A key already recorded keeps its row, e.g. a demo file a seed stores twice.
  await db.insert(assets).values(row).onConflictDoNothing()

  return row
}

/** The document reference for an asset: its preview when it has one. */
export const assetRef = (asset: { previewKey: string | null; originalKey: string }) =>
  storeRef(asset.previewKey ?? asset.originalKey)
