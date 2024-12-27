import localforage from 'localforage'
import { useEffect } from 'react'
import { decode, encode } from 'turbo-stream'

function promiseToReadableStream(
  promise: Promise<Uint8Array | null>
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const chunk = await promise
        if (chunk !== null) {
          controller.enqueue(chunk)
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

export class LocalForageAdapter {
  async getItem<T>(key: string): Promise<T | null> {
    const encoded = localforage.getItem<Uint8Array>(key)

    if (!(await encoded)) return null

    const stream = promiseToReadableStream(encoded)
    const decoded = await decode(stream)
    const data = decoded.value

    await decoded.done
    return data as T
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

export const cache = new LocalForageAdapter()

type UseClientCacheProps<T> = {
  data: T
  key: string
}

export const useClientCache = <T>({ data, key }: UseClientCacheProps<T>) => {
  useEffect(() => {
    if (!data) return
    const putDataToCache = async () => await cache.setItem(key, data)
    putDataToCache()
  }, [data, key])
}
