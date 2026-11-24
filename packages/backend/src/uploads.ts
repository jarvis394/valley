import { Server, type Upload } from '@tus/server'
import type { Db } from '@valley/db'
import { contentTypeFor, type Storage } from '@valley/storage'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { recordAsset } from './assets'
import { BackendError } from './errors'
import { previewKeyFor } from './media-processing'
import { requireProject } from './projects'

/** What the client attaches to a tus upload. Values arrive as strings. */
export const uploadMetadataSchema = z.object({
  projectId: z.string().regex(/^[a-z0-9-]{1,64}$/i),
  name: z.string().min(1).max(255),
  /** Browsers leave it empty for formats they don't know, such as RAW; the name decides then. */
  contentType: z.string().max(255).nullish(),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
})

export type UploadMetadata = z.infer<typeof uploadMetadataSchema> & { contentType: string }

/** The asset the client adds to its document once an upload finishes. */
export interface UploadedAsset {
  kind: 'image' | 'video'
  name: string
  src: string
  width: number
  height: number
  size: number
}

export interface UploadServerOptions {
  db: Db
  storage: Storage
  /** Route the tus endpoint is mounted at, e.g. `/api/uploads`. */
  path: string
  maxSize: number
  /** Resolves the caller's account or throws. Runs on every tus request. */
  authorize: (request: Request) => Promise<{ accountId: string }>
  /** URL the editor loads a stored key from. */
  urlFor: (key: string) => string
}

const MEDIA_TYPE = /^(image|video)\/[\w.+-]+$/

/** The tail `namingFunction` gives every upload key; anything else, like `..`, is rejected. */
const UPLOAD_KEY = /^([a-z0-9-]{1,64})\/originals\/[\w-]{16}(?:\.[a-z0-9]{1,8})?$/i

function parseMetadata(metadata: Upload['metadata']): UploadMetadata {
  const result = uploadMetadataSchema.safeParse(metadata ?? {})
  if (!result.success) {
    throw { status_code: 400, body: `Invalid upload metadata: ${result.error.message}\n` }
  }

  const declared = result.data.contentType
  const contentType =
    declared && MEDIA_TYPE.test(declared) ? declared : contentTypeFor(result.data.name)
  if (!MEDIA_TYPE.test(contentType)) {
    throw { status_code: 415, body: `${result.data.name} is not an image or a video\n` }
  }

  return { ...result.data, contentType }
}

const extensionOf = (name: string) => {
  const match = /\.([a-z0-9]{1,8})$/i.exec(name)

  return match ? `.${match[1]!.toLowerCase()}` : ''
}

/** tus hooks reject by throwing `{ status_code, body }`. */
const toTusError = (error: unknown) =>
  error instanceof BackendError ? { status_code: error.status, body: `${error.message}\n` } : error

export function createUploadServer(options: UploadServerOptions) {
  const { db, storage, path, maxSize, authorize, urlFor } = options

  const readFileId = (request: Request) =>
    decodeURIComponent(new URL(request.url).pathname.slice(path.length + 1)) || undefined

  /**
   * Drops a finished upload that couldn't be recorded. Its tus info goes too, so the client's
   * retry gets a 404 and starts a fresh upload instead of resuming one that is already complete.
   */
  async function discardUpload(key: string) {
    const keys = [key, previewKeyFor(key), ...storage.tusSidecarKeys(key)]
    await Promise.allSettled(keys.map((stored) => storage.delete(stored)))
  }

  return new Server({
    path,
    datastore: storage.tusStore(),
    maxSize,
    respectForwardedHeaders: true,
    generateUrl: (_request, { path: base, id }) => `${base}/${encodeURIComponent(id)}`,
    // Ids are storage keys with slashes, and routers may decode `%2F` before tus sees the URL.
    getFileIdFromRequest: readFileId,
    namingFunction: (_request, raw) => {
      const metadata = parseMetadata(raw ?? undefined)

      return `${storage.keyPrefix}projects/${metadata.projectId}/originals/${nanoid(16)}${extensionOf(metadata.name)}`
    },
    async onIncomingRequest(request) {
      if (request.method === 'GET') throw { status_code: 405, body: 'Downloads go through media\n' }
      const { accountId } = await authorize(request).catch((error: unknown) => {
        throw toTusError(error)
      })
      if (request.method !== 'POST' && request.method !== 'OPTIONS') {
        const key = readFileId(request)
        const prefix = `${storage.keyPrefix}projects/`
        const projectId = key?.startsWith(prefix)
          ? UPLOAD_KEY.exec(key.slice(prefix.length))?.[1]
          : undefined
        if (!projectId) throw { status_code: 404, body: 'Upload not found\n' }
        await requireProject(db, accountId, projectId).catch((error: unknown) => {
          throw toTusError(error)
        })
      }
    },
    async onUploadCreate(request, upload) {
      const metadata = parseMetadata(upload.metadata)
      const { accountId } = await authorize(request)
      await requireProject(db, accountId, metadata.projectId).catch((error: unknown) => {
        throw toTusError(error)
      })

      return {}
    },
    async onUploadFinish(_request, upload) {
      const metadata = parseMetadata(upload.metadata)
      const row = await recordAsset(db, storage, {
        projectId: metadata.projectId,
        key: upload.id,
        name: metadata.name,
        contentType: metadata.contentType,
        size: upload.size ?? upload.offset,
        fallback: { width: metadata.width ?? 16, height: metadata.height ?? 9 },
      }).catch(async (error: unknown) => {
        console.error(`Could not record upload ${upload.id}`, error)
        await discardUpload(upload.id)
        throw { status_code: 500, body: 'Could not store the upload\n' }
      })
      const body: UploadedAsset = {
        kind: row.kind,
        name: row.name,
        src: urlFor(row.previewKey ?? row.originalKey),
        width: row.width,
        height: row.height,
        size: row.size,
      }

      return {
        status_code: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    },
  })
}
