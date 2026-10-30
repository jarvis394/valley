import { ImagePlus, Upload } from 'lucide-react'
import { useRef, type CSSProperties, type PointerEvent } from 'react'
import { z } from 'zod'
import type { Asset } from '../../core/document'
import type { AssetId } from '../../core/ids'
import { clamp } from '../../core/placement'
import { useAssets, useEditor } from '../../editor/context'
import { cn, Popover } from '@valley/ui'

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

export async function readAssetFile(file: File): Promise<Omit<Asset, 'id'>> {
  // Object URLs only live as long as the tab. A real implementation uploads first.
  const src = URL.createObjectURL(file)
  const kind = file.type.startsWith('video/') ? 'video' : 'image'
  const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
    if (kind === 'video') {
      const video = document.createElement('video')
      video.addEventListener('loadedmetadata', () =>
        resolve({ width: video.videoWidth, height: video.videoHeight }),
      )
      video.addEventListener('error', () => resolve({ width: 16, height: 9 }))
      video.src = src
    } else {
      const image = new Image()
      image.addEventListener('load', () =>
        resolve({ width: image.naturalWidth, height: image.naturalHeight }),
      )
      image.addEventListener('error', () => resolve({ width: 1, height: 1 }))
      image.src = src
    }
  })
  return { kind, name: file.name, src, width, height, size: file.size }
}

export function useUploadAssets() {
  const editor = useEditor()
  return async (files: FileList | File[]) => {
    const media = [...files].filter((f) => /^(image|video)\//.test(f.type))
    return editor.commands.addAssets(await Promise.all(media.map(readAssetFile)))
  }
}

export function UploadButton({
  onUploaded,
  multiple,
  className,
  children,
}: {
  onUploaded: (ids: AssetId[]) => void
  multiple?: boolean
  className?: string
  children?: React.ReactNode
}) {
  const upload = useUploadAssets()
  return (
    <label
      className={cn(
        'flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-control px-3 text-sm text-neutral-200 hover:bg-control-hover',
        className,
      )}
    >
      <Upload className="size-4" />
      {children ?? 'Upload'}
      <input
        type="file"
        accept="image/*,video/*"
        multiple={multiple}
        className="sr-only"
        onChange={async (event) => {
          const files = event.currentTarget.files
          if (files?.length) onUploaded(await upload(files))
          event.currentTarget.value = ''
        }}
      />
    </label>
  )
}

/** Choose an existing project file (or upload a new one). */
export function AssetPicker({
  value,
  onChange,
  kinds = ['image', 'video'],
  label = 'Replace',
}: {
  value: AssetId | null
  onChange: (id: AssetId) => void
  kinds?: Asset['kind'][]
  label?: string
}) {
  const assets = Object.values(useAssets()).filter((asset) => kinds.includes(asset.kind))
  return (
    <Popover.Root>
      <Popover.Trigger className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-control text-sm text-neutral-200 hover:bg-control-hover">
        <ImagePlus className="size-4" /> {label}
      </Popover.Trigger>
      <Popover.Popup>
        <div className="grid max-h-72 grid-cols-3 gap-1 overflow-y-auto">
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
        </div>
        <UploadButton className="mt-2" onUploaded={([id]) => id && onChange(id)} />
      </Popover.Popup>
    </Popover.Root>
  )
}
