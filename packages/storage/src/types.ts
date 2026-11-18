import type { DataStore } from '@tus/server'

export type StorageDriverName = 's3' | 'r2' | 'local' | 'immich'

export interface StoredObject {
  size: number
  contentType?: string
  lastModified?: Date
  etag?: string
}

/** Inclusive byte range, as in an HTTP `Range` header. */
export interface ByteRange {
  start: number
  end: number
}

export interface ReadResult extends StoredObject {
  body: ReadableStream<Uint8Array>
  /** Present when a range was requested; `size` stays the whole object's size. */
  range?: ByteRange
}

export interface ListedObject {
  key: string
  size: number
  lastModified?: Date
}

/**
 * The one API every driver implements. Keys are `/`-separated paths with no leading slash;
 * a driver maps them to whatever its backend calls a path.
 */
export interface Storage {
  readonly driver: StorageDriverName
  /** Prefix for keys the app creates. A driver that shares its root with another app sets one. */
  readonly keyPrefix: string
  head(key: string): Promise<StoredObject | null>
  /** `null` when the object does not exist. */
  read(key: string, range?: ByteRange): Promise<ReadResult | null>
  write(key: string, body: Uint8Array, options?: { contentType?: string }): Promise<void>
  /** Removes the object; missing objects are not an error. */
  delete(key: string): Promise<void>
  list(prefix?: string): AsyncIterable<ListedObject>
  /** Direct URL a browser can fetch without the app, when the backend is publicly readable. */
  publicUrl(key: string): string | null
  /** Resumable-upload backend writing to the same place, so a finished upload's id is its key. */
  tusStore(): DataStore
  /** Keys a finished tus upload leaves next to its data, for cleanup. */
  tusSidecarKeys(key: string): string[]
}

export class StorageError extends Error {
  constructor(
    message: string,
    readonly code: 'invalid-key' | 'read-only' | 'not-configured',
  ) {
    super(message)
  }
}
