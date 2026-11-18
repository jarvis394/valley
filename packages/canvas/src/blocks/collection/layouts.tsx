import { JustifiedGrid, MasonryGrid } from '@egjs/react-grid'
import { useState, type CSSProperties, type ReactNode } from 'react'
import type { Asset } from '../../core/document'
import type { GalleryStyle } from '../../core/theme'
import { Photo } from '../shared/photo'
import { cn } from '@valley/ui'

const ratio = (asset: Asset) => `${asset.width} / ${asset.height}`

function Item({
  asset,
  roundness,
  className,
  style,
}: {
  asset: Asset
  roundness: number
  className?: string
  style?: CSSProperties
}) {
  return <Photo asset={asset} className={className} style={{ borderRadius: roundness, ...style }} />
}

/**
 * egjs places items after measuring them in the browser, so the server markup stays hidden
 * until the first layout lands instead of flashing a stack of full-width images.
 */
function useRevealOnLayout() {
  const [ready, setReady] = useState(false)

  return {
    className: cn('transition-opacity duration-300', !ready && 'opacity-0'),
    onRenderComplete: () => setReady(true),
  }
}

function Justified({ items, style }: { items: Asset[]; style: GalleryStyle }) {
  const reveal = useRevealOnLayout()

  return (
    <JustifiedGrid
      {...reveal}
      gap={style.spacing}
      sizeRange={[style.size * 0.75, style.size * 1.5]}
      columnRange={[1, 8]}
      isCroppedSize
      autoResize
      useResizeObserver
    >
      {items.map((asset) => (
        <Item
          key={asset.id}
          asset={asset}
          roundness={style.roundness}
          style={{ aspectRatio: ratio(asset) }}
        />
      ))}
    </JustifiedGrid>
  )
}

function Masonry({ items, style }: { items: Asset[]; style: GalleryStyle }) {
  const reveal = useRevealOnLayout()

  return (
    <MasonryGrid
      {...reveal}
      gap={style.spacing}
      align="stretch"
      maxStretchColumnSize={style.size * 1.5}
      autoResize
      useResizeObserver
    >
      {items.map((asset) => (
        <Item
          key={asset.id}
          asset={asset}
          roundness={style.roundness}
          style={{ aspectRatio: ratio(asset) }}
        />
      ))}
    </MasonryGrid>
  )
}

function SquareGrid({ items, style }: { items: Asset[]; style: GalleryStyle }) {
  return (
    <div
      className="grid"
      style={{
        gap: style.spacing,
        // At least two columns on narrow screens, however large the items are.
        gridTemplateColumns: `repeat(auto-fill, minmax(min(${style.size}px, calc(50% - ${style.spacing}px)), 1fr))`,
      }}
    >
      {items.map((asset) => (
        <Item key={asset.id} asset={asset} roundness={style.roundness} className="aspect-square" />
      ))}
    </div>
  )
}

function Row({ items, style }: { items: Asset[]; style: GalleryStyle }) {
  return (
    <div
      className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      style={{ gap: style.spacing, scrollbarWidth: 'none' }}
    >
      {items.map((asset) => (
        <Item
          key={asset.id}
          asset={asset}
          roundness={style.roundness}
          className="shrink-0 snap-start"
          style={{ aspectRatio: ratio(asset), height: style.size }}
        />
      ))}
    </div>
  )
}

const LAYOUTS: Record<
  GalleryStyle['layout'],
  (props: { items: Asset[]; style: GalleryStyle }) => ReactNode
> = {
  justified: Justified,
  grid: SquareGrid,
  masonry: Masonry,
  horizontal: Row,
}

/** The published look of a collection, as viewers and the editor preview see it. */
export function GalleryLayout({ items, style }: { items: Asset[]; style: GalleryStyle }) {
  const Layout = LAYOUTS[style.layout]

  return <Layout key={style.layout} items={items} style={style} />
}
