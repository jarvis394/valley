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
type Slide = NonNullable<PhotoSwipe['currSlide']>

const LightboxContext = createContext<OpenLightbox | null>(null)

const RADIUS_EASING = 'cubic-bezier(0.4, 0, 0.22, 1)'

/** Marks the element showing an asset, so the lightbox can zoom from and back to it. */
export const lightboxTarget = (assetId: AssetId) => ({ 'data-lightbox-asset': assetId })

const targetOf = (assetId: AssetId) =>
  document.querySelector<HTMLElement>(`[data-lightbox-asset="${CSS.escape(assetId)}"]`) ?? undefined

// Kept outside components: the React Compiler can't compile a dynamic import.
const loadPhotoSwipe = () => import('photoswipe').then((module) => module.default)

function slideImageElements(slide: Slide | undefined): HTMLElement[] {
  if (!slide) return []
  const elements: HTMLElement[] = []
  if (slide.content.element instanceof HTMLElement) elements.push(slide.content.element)
  const placeholder = slide.getPlaceholderElement()
  if (placeholder instanceof HTMLElement && !elements.includes(placeholder)) {
    elements.push(placeholder)
  }

  return elements
}

/**
 * PhotoSwipe scales the open image down by `s = thumbWidth / openWidth` at the closed state,
 * so CSS `border-radius` is divided by `s` to visually match the thumbnail's corners.
 */
function closedBorderRadius(slide: Slide | undefined, thumb: HTMLElement | undefined): string {
  if (!slide || !thumb) return '0px'
  const radius = Number.parseFloat(getComputedStyle(thumb).borderTopLeftRadius) || 0
  if (!radius) return '0px'
  const thumbWidth = thumb.getBoundingClientRect().width
  const openWidth = slide.width * slide.zoomLevels.initial
  const scale = thumbWidth > 0 && openWidth > 0 ? thumbWidth / openWidth : 1

  return `${(radius / scale).toFixed(1)}px`
}

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
  const hiddenThumb = useRef<HTMLElement | null>(null)
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
    let opened = false
    let destroyed = false
    let hideFrame = 0
    const lastActive = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const setHiddenThumb = (nextThumb: HTMLElement | undefined) => {
      if (hiddenThumb.current === nextThumb) return
      if (hiddenThumb.current) hiddenThumb.current.style.visibility = ''
      hiddenThumb.current = nextThumb ?? null
      if (hiddenThumb.current) hiddenThumb.current.style.visibility = 'hidden'
    }

    const activeThumb = (pswpInstance: PhotoSwipe) => {
      const activeAsset = assets[pswpInstance.currIndex]

      return activeAsset ? targetOf(activeAsset.id) : undefined
    }

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
        // Prevent PhotoSwipe from calling focus() without preventScroll, which jumps the scroll position.
        returnFocus: false,
        // A shared link opens before the grid has settled, so there is nothing to zoom from.
        showHideAnimationType: zoomFromPage.current ? 'zoom' : 'fade',
      })
      zoomFromPage.current = false

      next.on('beforeOpen', () => {
        // Keep the zooming photo behind the fixed app bar (z-50) while opening and closing.
        next.element?.style.setProperty('--pswp-root-z-index', '40')
      })

      next.on('openingAnimationStart', () => {
        opened = true
        document.documentElement.dataset.lightbox = 'open'
        next.element?.style.setProperty('--pswp-root-z-index', '40')
        const thumb = activeThumb(next)
        // PhotoSwipe unhides its placeholder right after this event; wait one frame so the slot never flashes empty.
        hideFrame = requestAnimationFrame(() => {
          if (!destroyed) setHiddenThumb(activeThumb(next))
        })
        const radius = closedBorderRadius(next.currSlide, thumb)
        if (radius === '0px') return
        const images = slideImageElements(next.currSlide)
        for (const img of images) {
          img.style.transition = 'none'
          img.style.borderRadius = radius
          // Flush start radius so the transition to 0px animates from the thumbnail's corners.
          void img.offsetWidth
          img.style.transition = `border-radius var(--pswp-transition-duration) ${RADIUS_EASING}`
          img.style.borderRadius = '0px'
        }
      })

      next.on('openingAnimationEnd', () => {
        next.element?.style.removeProperty('--pswp-root-z-index')
        for (const img of slideImageElements(next.currSlide)) {
          img.style.transition = ''
          img.style.borderRadius = '0px'
        }
      })

      next.on('change', () => {
        // PhotoSwipe dispatches an initial `change` inside init() ~50ms before the placeholder is shown.
        if (opened) setHiddenThumb(activeThumb(next))
        setPhoto(assets[next.currIndex]?.id ?? null)
      })

      next.on('closingAnimationStart', () => {
        next.element?.style.setProperty('--pswp-root-z-index', '40')
        delete document.documentElement.dataset.lightbox
        const thumb = activeThumb(next)
        setHiddenThumb(thumb)
        const radius = closedBorderRadius(next.currSlide, thumb)
        for (const img of slideImageElements(next.currSlide)) {
          img.style.transition = `border-radius var(--pswp-transition-duration) ${RADIUS_EASING}`
          img.style.borderRadius = radius
        }
      })

      next.on('close', () => {
        instance.current = null
        setPhoto(null)
      })

      next.on('destroy', () => {
        destroyed = true
        cancelAnimationFrame(hideFrame)
        setHiddenThumb(undefined)
        delete document.documentElement.dataset.lightbox
        if (lastActive?.isConnected) lastActive.focus({ preventScroll: true })
      })

      instance.current = next
      next.init()
    })

    return () => void (cancelled = true)
  }, [current, store, registry])

  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- removes PhotoSwipe's own DOM when the page goes away while it is open
  useEffect(
    () => () => {
      if (hiddenThumb.current) hiddenThumb.current.style.visibility = ''
      delete document.documentElement.dataset.lightbox
      instance.current?.destroy()
    },
    [],
  )

  return <LightboxContext value={open}>{children}</LightboxContext>
}

/** Opens the lightbox at an asset, or null where there is no lightbox (the editor). */
export const useLightbox = () => use(LightboxContext)
