import {
  cachified as baseCachified,
  verboseReporter,
  mergeReporters,
  type CacheEntry,
  type CachifiedOptions,
  type Cache,
  totalTtl,
  type CreateReporter,
} from '@epic-web/cachified'
import { remember } from '../utils/remember'
import { LRUCache } from 'lru-cache'
import { cachifiedTimingReporter, type Timings } from './timing.server'
import { redisJsonCacheAdapter } from 'cachified-redis-json-adapter'
import { createClient } from 'redis'

const redisClient = remember('redis-cache', () => createClient())
export const redisCache = redisJsonCacheAdapter(redisClient)

const lru = remember(
  'lru-cache',
  () => new LRUCache<string, CacheEntry<unknown>>({ max: 5000 })
)

export const lruCache = {
  name: 'lru-memory-cache',
  set: (key, value) => {
    const ttl = totalTtl(value?.metadata)
    lru.set(key, value, {
      ttl: ttl === Infinity ? undefined : ttl,
      start: value?.metadata?.createdTime,
    })
    return value
  },
  get: (key) => lru.get(key),
  delete: (key) => lru.delete(key),
} satisfies Cache

// const cacheEntrySchema = z.object({
//   metadata: z.object({
//     createdTime: z.number(),
//     ttl: z.number().nullable().optional(),
//     swr: z.number().nullable().optional(),
//   }),
//   value: z.unknown(),
// })
// const cacheQueryResultSchema = z.object({
//   metadata: z.string(),
//   value: z.string(),
// })

export async function cachified<Value>(
  {
    timings,
    ...options
  }: CachifiedOptions<Value> & {
    timings?: Timings
  },
  reporter: CreateReporter<Value> = verboseReporter<Value>()
): Promise<Value> {
  return baseCachified(
    options,
    mergeReporters(cachifiedTimingReporter(timings), reporter)
  )
}
