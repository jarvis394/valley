import { parseDocument, type CanvasDocument } from '@valley/canvas'
import { joinUrl } from '@valley/storage'
import { getRegistry } from './registry'

/**
 * Stored documents point at media with `store:<key>` instead of a URL, because the same
 * file is served from a different place by the editor, the live gallery and a static export.
 */
export const STORE_SCHEME = 'store:'

export type UrlFor = (key: string) => string

export const storeRef = (key: string) => `${STORE_SCHEME}${key}`

export const refKey = (src: string | null | undefined) =>
  src?.startsWith(STORE_SCHEME) ? src.slice(STORE_SCHEME.length) : null

export const resolveRef = (src: string | null | undefined, urlFor: UrlFor) => {
  const key = refKey(src)

  return key ? urlFor(key) : (src ?? undefined)
}

/** `urlFor` that serves keys from a route mounted at `base`, e.g. `/api/media`. */
export const mediaRoute =
  (base: string): UrlFor =>
  (key) =>
    joinUrl(base, key)

function mapSources(doc: CanvasDocument, map: (src: string) => string): CanvasDocument {
  const assets = Object.fromEntries(
    Object.entries(doc.assets).map(([id, asset]) => [
      id,
      { ...asset, src: map(asset.src), poster: asset.poster && map(asset.poster) },
    ]),
  )
  const authorAvatar = doc.meta.authorAvatar && map(doc.meta.authorAvatar)

  return { ...doc, assets, meta: { ...doc.meta, authorAvatar } } as CanvasDocument
}

/**
 * Turns stored references into URLs a surface can load. It parses first, so documents saved
 * under an older schema reach every surface migrated.
 */
export const resolveDocument = (doc: unknown, urlFor: UrlFor) =>
  mapSources(parseDocument(doc, getRegistry()).doc, (src) => resolveRef(src, urlFor) ?? src)

/** Turns URLs under `base` back into stored references. Other URLs are kept as they are. */
export function referenceDocument(doc: CanvasDocument, base: string) {
  const prefix = `${base}/`

  return mapSources(doc, (src) => {
    if (!src.startsWith(prefix)) return src

    try {
      return storeRef(src.slice(prefix.length).split('/').map(decodeURIComponent).join('/'))
    } catch {
      // A malformed escape can't name a stored key; keep the URL rather than fail the save.
      return src
    }
  })
}

/** Every storage key a document shows. */
export function documentKeys(doc: CanvasDocument) {
  const sources = Object.values(doc.assets).flatMap((asset) => [asset.src, asset.poster])
  sources.push(doc.meta.authorAvatar)

  return [...new Set(sources.map(refKey).filter((key) => key !== null))]
}
