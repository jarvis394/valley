import { startTransition, useEffect, useState } from 'react'
import {
  type ClientActionFunctionArgs,
  type LoaderFunctionArgs,
  useNavigate,
  useRouteLoaderData,
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

type ClientLoaderFunctionArgs<T = Record<string, unknown>> =
  LoaderFunctionArgs & {
    serverLoader: () => Promise<T>
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CacheData<T = Record<string, any>> = T & {
  serverData?: T
  deferredServerData?: Promise<T>
  key?: string
}

const augmentStorageAdapter = (storage: Storage) => {
  return {
    getItem: async (key: string) => {
      try {
        const item = JSON.parse(storage.getItem(key) || '')

        return item
      } catch (_e) {
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
    return { adapter: augmentStorageAdapter(adapterInstance) }
  }
  return { adapter: adapter() }
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

export const cacheClientLoader = async <
  LoaderArgs extends ClientLoaderFunctionArgs = ClientLoaderFunctionArgs,
  Data = ReturnType<LoaderArgs['serverLoader']>,
>(
  { request, serverLoader }: LoaderArgs,
  {
    type = 'swr',
    key = constructKey(request),
    adapter = cache,
  }: CacheClientLoaderArgs = {
    type: 'swr',
    key: constructKey(request),
    adapter: cache,
  }
): Promise<CacheData<Data>> => {
  const existingData = (await adapter.getItem(key)) as Data

  if (type === 'normal' && existingData) {
    return {
      ...existingData,
      serverData: existingData,
      deferredServerData: undefined,
      key,
    }
  }

  const data = existingData ? existingData : ((await serverLoader()) as Data)
  const deferredServerData = existingData
    ? (serverLoader() as Promise<Data>)
    : undefined

  await adapter.setItem(key, data)

  return {
    ...(data ?? existingData),
    serverData: data,
    deferredServerData,
    key,
  }
}

export const createClientLoaderCache = <T extends ClientLoaderFunctionArgs>(
  props?: CacheClientLoaderArgs
) => {
  const clientLoader = (args: T) => cacheClientLoader<T>(args, props)
  clientLoader.hydrate = true
  return clientLoader
}

type UseCachedDataArgs<T extends CacheData> = {
  adapter?: CacheAdapter
  data?: T
}

export function useCachedData<T extends CacheData>({
  data,
  adapter = cache,
}: UseCachedDataArgs<T>) {
  const navigate = useNavigate()
  const [freshData, setFreshData] = useState<T['serverData']>({
    ...('serverData' in (data || {}) ? data?.serverData : data),
  })

  // Unpack deferred data from the server
  useEffect(() => {
    let isMounted = true
    if (data?.deferredServerData) {
      data.deferredServerData
        .then((newData) => {
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
      data?.serverData &&
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
    cacheKey: data?.key,
    invalidate: () => data?.key && invalidateCache(data.key),
  } as T & { cacheKey?: string; invalidate: () => Promise<void> }
}

export function useCachedRouteLoaderData<T extends CacheData>({
  adapter = cache,
  data: propsData,
  route,
}: UseCachedDataArgs<T> & { route: string }) {
  const loaderData = useRouteLoaderData(route) as T
  const data = propsData || loaderData
  const res = useCachedData<T>({ data, adapter })
  return res
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

export const useCacheInvalidator = () => ({ invalidateCache })
