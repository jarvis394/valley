import type PhotoSwipe from 'photoswipe'
import {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AssetId } from '../core/ids'
import { useRenderContext } from './context'

type OpenLightbox = (assetId: AssetId) => void

const LightboxContext = createContext<OpenLightbox | null>(null)

/** Marks the element showing an asset, so the lightbox can zoom from and back to it. */
export const lightboxTarget = (assetId: AssetId) => ({ 'data-lightbox-asset': assetId })

const targetOf = (assetId: AssetId) =>
  document.querySelector<HTMLElement>(`[data-lightbox-asset="${CSS.escape(assetId)}"]`) ?? undefined

// Kept outside components: the React Compiler can't compile a dynamic import.
const loadPhotoSwipe = () => import('photoswipe').then((module) => module.default)

export interface LightboxProps {
  /** The open photo. Pass it with `onPhotoChange` to keep it in the URL; omitted, it is local. */
  photo?: AssetId | null
  onPhotoChange?: (photo: AssetId | null) => void
}

/**
 * Pages through every photo the page shows, in document order. Only read-only surfaces
 * provide it; the editor keeps clicks for selection.
 */
export function LightboxProvider({
  photo,
  onPhotoChange,
  children,
}: LightboxProps & { children: ReactNode }) {
  const { store, registry } = useRenderContext()
  const [localPhoto, setLocalPhoto] = useState<AssetId | null>(null)
  const current = onPhotoChange ? (photo ?? null) : localPhoto
  const instance = useRef<PhotoSwipe | null>(null)
  const zoomFromPage = useRef(false)

  const setPhoto = useEffectEvent((next: AssetId | null) => {
    if (next === current) return
    if (onPhotoChange) onPhotoChange(next)
    else setLocalPhoto(next)
  })

  const open = (assetId: AssetId) => {
    zoomFromPage.current = true
    setPhoto(assetId)
  }

  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- keeps the PhotoSwipe instance, which lives outside React, on the current photo
  useEffect(() => {
    const { doc } = store.getState()
    const assets = registry.lightboxAssets(doc).flatMap((id) => {
      const asset = doc.assets[id]

      return asset?.kind === 'image' ? [asset] : []
    })
    const index = current ? assets.findIndex((asset) => asset.id === current) : -1
    const pswp = instance.current
    if (index === -1) return void pswp?.close()
    if (pswp) return void (pswp.currIndex !== index && pswp.goTo(index))
    let cancelled = false

    void loadPhotoSwipe().then((PhotoSwipe) => {
      if (cancelled) return
      const next = new PhotoSwipe({
        dataSource: assets.map((asset) => ({
          src: asset.src,
          // Without it PhotoSwipe draws a gray box until the photo loads; the page already has it.
          msrc: asset.src,
          width: asset.width,
          height: asset.height,
          alt: asset.name,
          element: targetOf(asset.id),
        })),
        index,
        bgOpacity: 0.94,
        // A shared link opens before the grid has settled, so there is nothing to zoom from.
        showHideAnimationType: zoomFromPage.current ? 'zoom' : 'fade',
      })
      zoomFromPage.current = false
      next.on('change', () => setPhoto(assets[next.currIndex]?.id ?? null))
      next.on('close', () => {
        instance.current = null
        setPhoto(null)
      })
      instance.current = next
      next.init()
    })

    return () => void (cancelled = true)
  }, [current, store, registry])

  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- removes PhotoSwipe's own DOM when the page goes away while it is open
  useEffect(() => () => instance.current?.destroy(), [])

  return <LightboxContext value={open}>{children}</LightboxContext>
}

/** Opens the lightbox at an asset, or null where there is no lightbox (the editor). */
export const useLightbox = () => use(LightboxContext)
