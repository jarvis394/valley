import type { ComponentProps } from 'react'
import type { Asset } from '../../core/document'
import { lightboxTarget, useLightbox } from '../../render/lightbox'
import { Media } from './media'
import { cn } from '@valley/ui'

/** A gallery item. Where the page has a lightbox, images open in it. */
export function Photo({ asset, className, ...props }: ComponentProps<'figure'> & { asset: Asset }) {
  const openLightbox = useLightbox()
  const media = <Media asset={asset} className="size-full" />
  const classes = cn('block overflow-hidden bg-white/3', className)

  if (!openLightbox || asset.kind !== 'image') {
    return (
      <figure {...lightboxTarget(asset.id)} className={classes} {...props}>
        {media}
      </figure>
    )
  }

  return (
    <button
      type="button"
      aria-label={`Open ${asset.name}`}
      {...lightboxTarget(asset.id)}
      className={cn(classes, 'cursor-zoom-in')}
      style={props.style}
      onClick={() => openLightbox(asset.id)}
    >
      {media}
    </button>
  )
}
