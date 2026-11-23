import { useRef, useState, type CSSProperties, type ReactElement } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Asset } from '../../core/document'
import type { GalleryStyle } from '../../core/theme'
import { cn, IconButton } from '@valley/ui'
import {
  assetRatio,
  gridColumnsClass,
  gridTileAspect,
  normalizedTracks,
  type AlbumNode,
} from './layout'

export type RenderIslandPhoto = (
  asset: Asset,
  options: { className?: string; style?: CSSProperties },
) => ReactElement

interface IslandLayoutProps {
  items: Asset[]
  style: GalleryStyle
  clipRadius: number
  tileRadius: number
  renderPhoto: RenderIslandPhoto
}

export function IslandCollage({
  album,
  style,
  clipRadius,
  tileRadius,
  renderPhoto,
}: Omit<IslandLayoutProps, 'items'> & { album: AlbumNode | null }) {
  if (!album) return null

  const renderNode = (node: AlbumNode, fillParent: boolean, key: string): ReactElement => {
    if (node.kind === 'photo') {
      return (
        <div
          key={key}
          className={cn('relative min-h-0 min-w-0', fillParent ? 'size-full' : 'w-full')}
          style={fillParent ? undefined : { aspectRatio: `${node.ratio}` }}
        >
          {renderPhoto(node.asset, {
            className: 'absolute inset-0 size-full',
            style: { borderRadius: tileRadius },
          })}
        </div>
      )
    }

    if (node.kind === 'col') {
      if (!fillParent) {
        return (
          <div key={key} className="flex w-full flex-col" style={{ gap: style.spacing }}>
            {node.children.map((child, index) => renderNode(child, false, `${key}-${index}`))}
          </div>
        )
      }

      return (
        <div
          key={key}
          className="grid size-full min-h-0 min-w-0"
          style={{
            gap: style.spacing,
            gridTemplateRows: normalizedTracks(node.children.map((child) => 1 / child.ratio)),
          }}
        >
          {node.children.map((child, index) => renderNode(child, true, `${key}-${index}`))}
        </div>
      )
    }

    const gridTemplateColumns = normalizedTracks(node.children.map((child) => child.ratio))
    const allPhotos = node.children.every((child) => child.kind === 'photo')

    if (!fillParent && allPhotos) {
      return (
        <div key={key} className="grid w-full" style={{ gap: style.spacing, gridTemplateColumns }}>
          {node.children.map((child, index) => renderNode(child, false, `${key}-${index}`))}
        </div>
      )
    }

    return (
      <div
        key={key}
        className={cn('grid min-h-0 min-w-0', fillParent ? 'size-full' : 'w-full')}
        style={{
          gap: style.spacing,
          gridTemplateColumns,
          aspectRatio: fillParent ? undefined : `${node.ratio}`,
        }}
      >
        {node.children.map((child, index) => renderNode(child, true, `${key}-${index}`))}
      </div>
    )
  }

  return (
    <div className="overflow-hidden" style={{ borderRadius: clipRadius }}>
      {renderNode(album, false, 'root')}
    </div>
  )
}

export function IslandGrid({
  items,
  style,
  clipRadius,
  tileRadius,
  renderPhoto,
}: IslandLayoutProps) {
  const aspect = gridTileAspect(items)

  return (
    <div
      className={cn('grid overflow-hidden', gridColumnsClass(items.length))}
      style={{ gap: style.spacing, borderRadius: clipRadius }}
    >
      {items.map((asset) => (
        <div key={asset.id} className={cn('relative min-w-0 w-full', aspect)}>
          {renderPhoto(asset, {
            className: 'absolute inset-0 size-full',
            style: { borderRadius: tileRadius },
          })}
        </div>
      ))}
    </div>
  )
}

export function IslandCarousel({ items, style, clipRadius, renderPhoto }: IslandLayoutProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const clampedIndex = Math.min(activeIndex, Math.max(0, items.length - 1))
  const slideHeight = Math.round(style.size * 1.65)
  const slideRadius = Math.max(0, Math.min(clipRadius, style.spacing > 0 ? clipRadius : 0))

  const slideElements = () =>
    Array.from(trackRef.current?.children ?? []).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    )

  const scrollToSlide = (targetIndex: number) => {
    const track = trackRef.current
    const slide = slideElements()[targetIndex]
    if (!track || !slide) return
    track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' })
  }

  const syncIndex = () => {
    const track = trackRef.current
    if (!track) return
    const slides = slideElements()
    if (slides.length === 0) return
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) {
      setActiveIndex(slides.length - 1)

      return
    }
    let nearest = 0
    let bestDistance = Number.POSITIVE_INFINITY
    for (let i = 0; i < slides.length; i++) {
      const distance = Math.abs(slides[i]!.offsetLeft - track.scrollLeft)
      if (distance < bestDistance) {
        bestDistance = distance
        nearest = i
      }
    }
    setActiveIndex(nearest)
  }

  return (
    <div className="group/carousel relative">
      <div
        ref={trackRef}
        onScroll={syncIndex}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none]"
        style={{ gap: style.spacing, borderRadius: clipRadius }}
      >
        {items.map((asset) => (
          <div
            key={asset.id}
            className="relative max-w-full shrink-0 snap-start"
            style={{
              height: `clamp(240px, 56vw, ${slideHeight}px)`,
              aspectRatio: `${assetRatio(asset)}`,
            }}
          >
            {renderPhoto(asset, {
              className: 'absolute inset-0 size-full',
              style: { borderRadius: slideRadius },
            })}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <span className="pointer-events-none absolute top-2.5 right-2.5 rounded-full bg-black/50 px-2.5 py-1 text-caption font-medium text-white/90 tabular-nums backdrop-blur-md">
            {clampedIndex + 1} / {items.length}
          </span>

          {clampedIndex > 0 && (
            <IconButton
              variant="overlay"
              size="md"
              aria-label="Previous photo"
              className="absolute top-1/2 left-2.5 hidden -translate-y-1/2 opacity-0 transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100 sm:inline-flex"
              onClick={() => scrollToSlide(Math.max(0, clampedIndex - 1))}
            >
              <ChevronLeft className="size-4" />
            </IconButton>
          )}

          {clampedIndex < items.length - 1 && (
            <IconButton
              variant="overlay"
              size="md"
              aria-label="Next photo"
              className="absolute top-1/2 right-2.5 hidden -translate-y-1/2 opacity-0 transition-opacity group-hover/carousel:opacity-100 focus-visible:opacity-100 sm:inline-flex"
              onClick={() => scrollToSlide(Math.min(items.length - 1, clampedIndex + 1))}
            >
              <ChevronRight className="size-4" />
            </IconButton>
          )}

          {items.length <= 12 && (
            <div className="mt-2.5 flex items-center justify-center gap-1.5">
              {items.map((asset, index) => (
                <button
                  key={asset.id}
                  type="button"
                  aria-label={`Go to photo ${index + 1}`}
                  aria-current={index === clampedIndex ? 'true' : undefined}
                  onClick={() => scrollToSlide(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    index === clampedIndex
                      ? 'w-4 bg-white/80'
                      : 'w-1.5 bg-white/24 hover:bg-white/48',
                  )}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
