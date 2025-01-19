/// <reference lib="WebWorker" />

import {
  clearUpOldCaches,
  DefaultFetchHandler,
  EnhancedCache,
  isDocumentRequest,
  isLoaderRequest,
} from '@remix-pwa/sw'

const version = 'v1'

const DOCUMENT_CACHE_NAME = 'document-cache'
const ASSET_CACHE_NAME = 'asset-cache'
const DATA_CACHE_NAME = 'data-cache'

const documentCache = new EnhancedCache(DOCUMENT_CACHE_NAME, {
  version,
  strategy: 'CacheFirst',
  strategyOptions: {
    maxEntries: 64,
  },
})

const assetCache = new EnhancedCache(ASSET_CACHE_NAME, {
  version,
  strategy: 'CacheFirst',
  strategyOptions: {
    maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
    maxEntries: 100,
  },
})

const dataCache = new EnhancedCache(DATA_CACHE_NAME, {
  version,
  strategy: 'NetworkFirst',
  strategyOptions: {
    networkTimeoutInSeconds: 10,
    maxEntries: 72,
  },
})

export const defaultFetchHandler: DefaultFetchHandler = async ({ context }) => {
  const request = context.event.request
  const url = new URL(request.url)

  if (isDocumentRequest(request)) {
    return documentCache.handleRequest(request)
  }

  if (isLoaderRequest(request)) {
    return dataCache.handleRequest(request)
  }

  if (self.__workerManifest.assets.includes(url.pathname)) {
    return assetCache.handleRequest(request)
  }

  return fetch(request)
}

declare let self: ServiceWorkerGlobalScope

self.addEventListener('install', (event) => {
  console.log('Service worker installed')

  event.waitUntil(
    Promise.all([
      assetCache.preCacheUrls(
        self.__workerManifest.assets.filter(
          (url) => !url.endsWith('.map') && !url.endsWith('.js')
        )
      ),
      self.skipWaiting(),
    ])
  )
})

self.addEventListener('activate', (event) => {
  console.log('Service worker activated')

  event.waitUntil(
    Promise.all([
      clearUpOldCaches(
        [DOCUMENT_CACHE_NAME, DATA_CACHE_NAME, ASSET_CACHE_NAME],
        version
      ),
      self.clients.claim(),
    ])
  )
})
