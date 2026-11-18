import { createReadStream } from 'node:fs'
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { FileStore } from '@tus/file-store'
import { assertKey, contentTypeFor, joinUrl } from './keys'
import { StorageError, type ByteRange, type Storage, type StorageDriverName } from './types'

export interface LocalStorageConfig {
  /** Directory every key lives under. Created on first write. */
  root: string
  /** Base URL that serves `root` directly, e.g. a CDN or nginx location. */
  publicUrl?: string
  keyPrefix?: string
  /** Prefixes the app may write or delete under. Everything is writable when omitted. */
  writablePrefixes?: string[]
}

const isMissing = (error: unknown) =>
  error instanceof Error && 'code' in error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')

/** Files on a mounted disk or volume. */
export class LocalStorage implements Storage {
  readonly driver: StorageDriverName = 'local'
  readonly keyPrefix: string
  readonly #root: string
  readonly #publicUrl?: string
  readonly #writablePrefixes?: string[]

  constructor({ root, publicUrl, keyPrefix = '', writablePrefixes }: LocalStorageConfig) {
    this.#root = path.resolve(root)
    this.#publicUrl = publicUrl
    this.keyPrefix = keyPrefix
    this.#writablePrefixes = writablePrefixes
  }

  async head(key: string) {
    try {
      const info = await stat(this.#path(key))
      if (!info.isFile()) return null

      return {
        size: info.size,
        contentType: contentTypeFor(key),
        lastModified: info.mtime,
        etag: `"${info.size.toString(36)}-${info.mtimeMs.toString(36)}"`,
      }
    } catch (error) {
      if (isMissing(error)) return null
      throw error
    }
  }

  async read(key: string, range?: ByteRange) {
    const object = await this.head(key)
    if (!object) return null

    const stream = createReadStream(this.#path(key), range)

    return {
      ...object,
      body: Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>,
      range,
    }
  }

  async write(key: string, body: Uint8Array) {
    const file = this.#writablePath(key)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, body)
  }

  async delete(key: string) {
    await rm(this.#writablePath(key), { force: true })
  }

  async *list(prefix = '') {
    const directory = prefix.includes('/') ? prefix.slice(0, prefix.lastIndexOf('/')) : ''
    const start = directory ? this.#path(directory) : this.#root
    let entries: string[]
    try {
      entries = await readdir(start, { recursive: true })
    } catch (error) {
      if (isMissing(error)) return
      throw error
    }

    for (const entry of entries.toSorted()) {
      const key = [directory, ...entry.split(path.sep)].filter(Boolean).join('/')
      if (!key.startsWith(prefix)) continue
      const info = await stat(path.join(start, entry))
      if (info.isFile()) yield { key, size: info.size, lastModified: info.mtime }
    }
  }

  publicUrl(key: string) {
    return this.#publicUrl ? joinUrl(this.#publicUrl, assertKey(key)) : null
  }

  tusStore() {
    return new FileStore({ directory: this.#root })
  }

  tusSidecarKeys(key: string) {
    return [`${key}.json`]
  }

  #path(key: string) {
    const file = path.join(this.#root, ...assertKey(key).split('/'))
    if (!file.startsWith(this.#root + path.sep)) {
      throw new StorageError(`Key escapes the storage root: ${key}`, 'invalid-key')
    }

    return file
  }

  #writablePath(key: string) {
    if (this.#writablePrefixes && !this.#writablePrefixes.some((p) => key.startsWith(p))) {
      throw new StorageError(`Key is read-only: ${key}`, 'read-only')
    }

    return this.#path(key)
  }
}
