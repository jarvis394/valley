import type { SerializeFrom } from 'react-router'
import React, { startTransition, useCallback, useEffect, useState } from 'react'
import {
  Await,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from 'react-router'
import { cache } from './adapter.client'

export interface CacheAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getItem: (key: string) => any | Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItem: (key: string, value: any) => Promise<any> | any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeItem: (key: string) => Promise<any> | any
}

const augmentStorageAdapter = (storage: Storage) => {
  return {
    getItem: async (key: string) => {
      try {
        const item = JSON.parse(storage.getItem(key) || '')

        return item
      } catch (e) {
        return storage.getItem(key)
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setItem: async (key: string, val: any) =>
      storage.setItem(key, JSON.stringify(val)),
    removeItem: async (key: string) => storage.removeItem(key),
  }
}

export const createCacheAdapter = (adapter: () => CacheAdapter) => {
  if (typeof document === 'undefined') return { adapter: undefined }
  const adapterInstance = adapter()
  if (adapterInstance instanceof Storage) {
    return {
      adapter: augmentStorageAdapter(adapterInstance),
    }
  }
  return {
    adapter: adapter(),
  }
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

type CacheClientLoaderArgs = {
  type?: 'swr' | 'normal'
  key?: string
  adapter?: CacheAdapter
}

export const cacheClientLoader = async <T,>(
  { request, serverLoader }: ClientLoaderFunctionArgs,
  {
    type = 'swr',
    key = constructKey(request),
    adapter = cache,
  }: CacheClientLoaderArgs = {
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

export const createClientLoaderCache = (props?: CacheClientLoaderArgs) => {
  const clientLoader = (args: ClientLoaderFunctionArgs) =>
    cacheClientLoader(args, props)
  clientLoader.hydrate = true
  return clientLoader
}

export function useCachedLoaderData<T>(
  {
    adapter = cache,
    data: propsData,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { adapter?: CacheAdapter; data?: any } = {
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
            startTransition(() => {
              adapter.setItem(data.key, newData)
              setFreshData(newData)
            })
          }
        })
        .catch((e: Error) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // Update the cache if the data changes
  useEffect(() => {
    if (
      data.serverData &&
      JSON.stringify(data.serverData) !== JSON.stringify(freshData)
    ) {
      startTransition(() => {
        setFreshData(data.serverData)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.serverData])

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
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) {
  const memoized = useCallback(
    ({
      children,
      fallback,
    }: {
      children: (data: SerializeFrom<T>) => React.ReactElement
      fallback?: (data: SerializeFrom<T>) => React.ReactElement
    }) => {
      return (
        <>
          {deferredServerData ? (
            <React.Suspense fallback={fallback?.(serverData)}>
              <Await resolve={deferredServerData}>{children as never}</Await>
            </React.Suspense>
          ) : (
            children(serverData ?? (args as T))
          )}
        </>
      )
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
