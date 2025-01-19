import localforage from 'localforage'
import React, { useCallback, useEffect, useState } from 'react'
import { decode, encode } from 'turbo-stream'
import type { SerializeFrom } from '@remix-run/server-runtime'
import {
  Await,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from '@remix-run/react'

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

export const cache: CacheAdapter = new LocalForageAdapter()

type UseClientCacheProps<T> = {
  data: T
  key: string
}

export function useClientCache<T>({ data, key }: UseClientCacheProps<T>) {
  useEffect(() => {
    if (!data) return
    cache.setItem(key, data)
  }, [data, key])
}

export interface CacheAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getItem: (key: string) => any | Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItem: (key: string, value: any) => Promise<any> | any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeItem: (key: string) => Promise<any> | any
}

export const decacheClientLoader = async <T,>(
  { request, serverAction }: ClientActionFunctionArgs,
  {
    key = constructKey(request),
    adapter = cache,
  }: { key?: string; adapter?: CacheAdapter }
) => {
  const data = await serverAction<T>()
  await adapter.removeItem(key)
  return data
}

export const cacheClientLoader = async <T,>(
  { request, serverLoader }: ClientLoaderFunctionArgs,
  {
    type = 'swr',
    key = constructKey(request),
    adapter = cache,
  }: { type?: 'swr' | 'normal'; key?: string; adapter?: CacheAdapter } = {
    type: 'swr',
    key: constructKey(request),
    adapter: cache,
  }
): Promise<
  SerializeFrom<T> & {
    serverData: SerializeFrom<T>
    deferredServerData: Promise<SerializeFrom<T>> | undefined
    key: string
  }
> => {
  const existingData = await adapter.getItem(key)

  if (type === 'normal' && existingData) {
    return {
      ...existingData,
      serverData: existingData as SerializeFrom<T>,
      deferredServerData: undefined,
      key,
    }
  }
  const data = existingData ? existingData : await serverLoader()

  await adapter.setItem(key, data)
  const deferredServerData = existingData ? serverLoader() : undefined
  return {
    ...(data ?? existingData),
    serverData: data as SerializeFrom<T>,
    deferredServerData,
    key,
  }
}

export function useCachedLoaderData<T>(
  {
    adapter = cache,
    data: propsData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }: { adapter?: CacheAdapter; data?: any } = {
    adapter: cache,
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loaderData = useLoaderData() as any
  const data = propsData || loaderData
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [freshData, setFreshData] = useState<any>({
    ...('serverData' in data ? data.serverData : data),
  })

  // Unpack deferred data from the server
  useEffect(() => {
    let isMounted = true
    if (data.deferredServerData) {
      data.deferredServerData
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((newData: any) => {
          if (isMounted) {
            adapter.setItem(data.key, newData)
            setFreshData(newData)
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((e: any) => {
          const res = e instanceof Response ? e : undefined
          if (res && res.status === 302) {
            const to = res.headers.get('Location')
            to && navigate(to)
          } else {
            throw e
          }
        })
    }
    return () => {
      isMounted = false
    }
  }, [adapter, data, navigate])

  // Update the cache if the data changes
  useEffect(() => {
    if (
      data.serverData &&
      JSON.stringify(data.serverData) !== JSON.stringify(freshData)
    ) {
      setFreshData(data.serverData)
    }
  }, [freshData, data.serverData])

  return {
    ...data,
    ...freshData,
    cacheKey: data.key,
    invalidate: () => invalidateCache(data.key),
  } as SerializeFrom<T> & {
    cacheKey?: string
    invalidate: () => Promise<void>
  }
}

const constructKey = (request: Request) => {
  const url = new URL(request.url)
  return url.pathname + url.search + url.hash
}

export const invalidateCache = async (key: string | string[]) => {
  const keys = Array.isArray(key) ? key : [key]
  const promises = []
  for (const k of keys) {
    promises.push(cache.removeItem(k))
  }
  await Promise.all(promises)
}

export const useCacheInvalidator = () => ({
  invalidateCache,
})

export function useSwrData<T>({
  serverData,
  deferredServerData,
  ...args
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  const memoized = useCallback(
    ({
      children,
      fallback,
    }: {
      children: (data: SerializeFrom<T>) => React.ReactElement
      fallback?: (data: SerializeFrom<T>) => React.ReactElement
    }) => {
      if (deferredServerData) {
        return (
          <React.Suspense fallback={fallback?.(serverData)}>
            <Await resolve={deferredServerData}>{children as never}</Await>
          </React.Suspense>
        )
      }

      return children(serverData ?? (args as T))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deferredServerData, serverData]
  )

  return memoized
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SWRAwait = ({ data, children, resolve }: any) => {
  if (data.deferredServerData) {
    return (
      <React.Suspense>
        <Await resolve={data.deferredServerData}>
          {(resolvedData) => (
            <React.Suspense>
              <Await resolve={resolvedData[resolve]}>{children as never}</Await>
            </React.Suspense>
          )}
        </Await>
      </React.Suspense>
    )
  }

  return (
    <React.Suspense>
      <Await resolve={data[resolve]}>{children as never}</Await>
    </React.Suspense>
  )
}
