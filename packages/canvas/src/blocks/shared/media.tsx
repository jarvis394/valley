import { ImagePlus, Upload } from 'lucide-react'
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { z } from 'zod'
import type { Asset } from '../../core/document'
import type { AssetId } from '../../core/ids'
import { clamp } from '../../core/placement'
import { useAssets, useRenderContext } from '../../render/context'
import { Button, cn, FileInput, IconButton, Popover, ScrollArea } from '@valley/ui'

export const focalPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
})

export type FocalPoint = z.infer<typeof focalPointSchema>
export const CENTER: FocalPoint = { x: 0.5, y: 0.5 }

export function Media({
  asset,
  focalPoint = CENTER,
  fit = 'cover',
  className,
  style,
}: {
  asset: Asset | undefined
  focalPoint?: FocalPoint
  fit?: 'cover' | 'contain'
  className?: string
  style?: CSSProperties
}) {
  if (!asset) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-neutral-800 text-neutral-500',
          className,
        )}
        style={style}
      >
        <ImagePlus className="size-8" />
      </div>
    )
  }
  const mediaStyle: CSSProperties = {
    objectFit: fit,
    objectPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
    ...style,
  }
  if (asset.kind === 'video') {
    return (
      <video
        src={asset.src}
        poster={asset.poster}
        className={className}
        style={mediaStyle}
        autoPlay
        muted
        loop
        playsInline
      />
    )
  }

  return (
    <img
      src={asset.src}
      alt={asset.name}
      className={className}
      style={mediaStyle}
      draggable={false}
      loading="lazy"
    />
  )
}

/** Drag the ring to choose which part of the image stays visible after cropping. Works with touch. */
export function FocalPointPicker({
  asset,
  value,
  onChange,
}: {
  asset: Asset
  value: FocalPoint
  onChange: (value: FocalPoint) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const setFromEvent = (event: PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    onChange({
      x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
    })
  }

  return (
    <div
      ref={ref}
      className="relative cursor-crosshair touch-none overflow-hidden rounded-xl select-none"
      style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        setFromEvent(event)
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) setFromEvent(event)
      }}
    >
      <Media asset={asset} className="size-full" />
      <span
        className="pointer-events-none absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.4)]"
        style={{ left: `${value.x * 100}%`, top: `${value.y * 100}%` }}
      />
    </div>
  )
}

export function UploadButton({
  onUploaded,
  multiple,
  iconOnly,
  className,
  children,
}: {
  onUploaded: (ids: AssetId[]) => void
  multiple?: boolean
  /** Icon button for a section header. */
  iconOnly?: boolean
  className?: string
  children?: ReactNode
}) {
  const { uploadAssets } = useRenderContext()
  const inputRef = useRef<HTMLInputElement>(null)
  if (!uploadAssets) return null

  const open = () => inputRef.current?.click()

  return (
    <>
      {iconOnly ? (
        <IconButton
          size="sm"
          aria-label={typeof children === 'string' ? children : 'Upload'}
          onClick={open}
        >
          <Upload className="size-4" />
        </IconButton>
      ) : (
        <Button
          variant="control"
          size="md"
          icon={<Upload className="size-4" />}
          className={className}
          onClick={open}
        >
          {children ?? 'Upload'}
        </Button>
      )}
      <FileInput
        ref={inputRef}
        accept="image/*,video/*"
        multiple={multiple}
        onFiles={async (files) => onUploaded(await uploadAssets(files))}
      />
    </>
  )
}

/** Choose an existing project file (or upload a new one). */
export function AssetPicker({
  value,
  onChange,
  kinds = ['image', 'video'],
  label = 'Replace',
  className,
}: {
  value: AssetId | null
  onChange: (id: AssetId) => void
  kinds?: Asset['kind'][]
  label?: string
  className?: string
}) {
  const assets = Object.values(useAssets()).filter((asset) => kinds.includes(asset.kind))

  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Button
            variant="control"
            size="md"
            icon={<ImagePlus className="size-4" />}
            className={className}
          />
        }
      >
        {label}
      </Popover.Trigger>
      <Popover.Popup>
        <ScrollArea
          scrollbar="plain"
          className="max-h-72"
          contentClassName="grid grid-cols-3 gap-1"
        >
          {assets.map((asset) => (
            <Popover.Close
              key={asset.id}
              onClick={() => onChange(asset.id)}
              className={cn(
                'aspect-square overflow-hidden rounded-lg outline-offset-2',
                asset.id === value && 'outline-2 outline-accent',
              )}
            >
              <Media asset={asset} className="size-full" />
            </Popover.Close>
          ))}
        </ScrollArea>
        <UploadButton className="mt-2" onUploaded={([id]) => id && onChange(id)} />
      </Popover.Popup>
    </Popover.Root>
  )
}
