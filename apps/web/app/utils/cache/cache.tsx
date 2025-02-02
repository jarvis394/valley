import React, { startTransition, useCallback, useEffect, useState } from 'react'
import { Await, useLoaderData, useNavigate } from 'react-router'
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CacheData<T = Record<string, any>> = T & {
  serverData?: T
  deferredServerData?: Promise<T>
  key?: string
}

type ClientLoaderArgs<T> = {
  request: Request
  params: Record<string, string | undefined>
  serverLoader: () => Promise<T>
}

type ClientActionArgs = {
  request: Request
  params: Record<string, string | undefined>
  serverAction: () => Promise<unknown>
}

export const decacheClientLoader = async (
  { request, serverAction }: ClientActionArgs,
  {
    key = constructKey(request),
    adapter = cache,
  }: { key?: string; adapter?: CacheAdapter }
) => {
  const data = await serverAction()
  await adapter.removeItem(key)
  return data
}

type CacheClientLoaderArgs = {
  type?: 'swr' | 'normal'
  key?: string
  adapter?: CacheAdapter
}

export const cacheClientLoader = async <T,>(
  { request, serverLoader }: ClientLoaderArgs<T>,
  {
    type = 'swr',
    key = constructKey(request),
    adapter = cache,
  }: CacheClientLoaderArgs = {
    type: 'swr',
    key: constructKey(request),
    adapter: cache,
  }
): Promise<CacheData<T>> => {
  const existingData = (await adapter.getItem(key)) as T

  if (type === 'normal' && existingData) {
    return {
      ...existingData,
      serverData: existingData as T,
      deferredServerData: undefined,
      key,
    }
  }
  const data = existingData ? existingData : ((await serverLoader()) as T)

  await adapter.setItem(key, data)
  const deferredServerData = existingData
    ? (serverLoader() as Promise<T>)
    : undefined
  return {
    ...(data ?? existingData),
    serverData: data,
    deferredServerData,
    key,
  }
}

export const createClientLoaderCache = <T extends CacheData>(
  props?: CacheClientLoaderArgs
) => {
  const clientLoader = (args: ClientLoaderArgs<T>) =>
    cacheClientLoader<T>(args, props)
  clientLoader.hydrate = true
  return clientLoader
}

type UseCachedLoaderDataArgs<T extends CacheData> = {
  adapter?: CacheAdapter
  data?: T
}

export function useCachedLoaderData<T extends CacheData>(
  { adapter = cache, data: propsData }: UseCachedLoaderDataArgs<T> = {
    adapter: cache,
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loaderData = useLoaderData() as T
  const data = propsData || loaderData
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [freshData, setFreshData] = useState<T['serverData']>({
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
              data.key && adapter.setItem(data.key, newData)
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
    invalidate: () => data.key && invalidateCache(data.key),
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
}: T & {
  serverData?: T
  deferredServerData?: Promise<T>
}) {
  const memoized = useCallback(
    ({
      children,
      fallback,
    }: {
      children: (data: T) => React.ReactElement
      fallback?: (data: T) => React.ReactElement
    }) => {
      return (
        <>
          {deferredServerData ? (
            <React.Suspense fallback={fallback?.(serverData as T)}>
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
