import { decode, encode } from 'turbo-stream'
import localforage from 'localforage'
import { CacheAdapter } from './cache'

export class LocalForageAdapter {
  async getItem<T>(key: string): Promise<T | null> {
    const encoded = await localforage.getItem<ReadableStream<string>>(key)
    if (!encoded) return null

    return (await decode(encoded)) as T
  }

  async setItem(key: string, value: unknown) {
    const stream = encode(value)
    const reader = stream.getReader().read()
    const setter = localforage.setItem(key, (await reader).value)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ;(await reader).done
    return await setter
  }

  async removeItem(key: string) {
    return localforage.removeItem(key)
  }
}

export const cache: CacheAdapter = new LocalForageAdapter()
