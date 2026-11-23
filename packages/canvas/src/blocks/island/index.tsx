import { Check, ChevronLeft, ChevronRight, ImagePlus, Trash2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import { z } from 'zod'
import { summarizeAssets } from '../../core/assets'
import type { Asset } from '../../core/document'
import { formatBytes } from '../../core/format'
import { assetIdSchema, type AssetId } from '../../core/ids'
import { FLOW } from '../../core/placement'
import { useAssets, useCoverAssetId } from '../../render/context'
import { defineBlock, type BlockInspectorProps, type BlockRenderProps } from '../../registry/types'
import { FileMenu } from '../collection/file-menu'
import { InlineText } from '../shared/inline-text'
import { Media, UploadButton } from '../shared/media'
import { Photo } from '../shared/photo'
import { typographyStyle, useResolvedTheme } from '../shared/theme'
import { islandMeasure, planAlbum, type IslandFrame, type IslandLayout } from './layout'
import { IslandCarousel, IslandCollage, IslandGrid } from './layouts'
import {
  cn,
  Field,
  FileIcon,
  IconButton,
  ImageIcon,
  Popover,
  ScrollArea,
  Section,
  Segmented,
  StatRow,
  SwitchField,
  TextField,
  TilePicker,
} from '@valley/ui'

export const ISLAND_LAYOUTS = ['collage', 'carousel', 'grid'] as const
export const ISLAND_FRAMES = ['card', 'minimal'] as const

const DEFAULT_ISLAND_PROPS = {
  layout: 'collage' as IslandLayout,
  frame: 'card' as IslandFrame,
  title: '',
  meta: '',
  caption: '',
  showCount: false,
}

const islandSchema = z.object({
  assetIds: z.array(assetIdSchema),
  layout: z.enum(ISLAND_LAYOUTS),
  frame: z.enum(ISLAND_FRAMES),
  title: z.string(),
  meta: z.string(),
  caption: z.string(),
  showCount: z.boolean(),
})

export type IslandProps = z.infer<typeof islandSchema>

declare module '../../core/document' {
  interface BlockPropsMap {
    island: IslandProps
  }
}

const CARD_INSET = 8
const MIN_CARD_INNER_RADIUS = 8

const Tile = ({ className }: { className?: string }) => (
  <span className={cn('min-h-0 min-w-0 rounded-[1px] bg-current/40', className)} />
)

const layoutOptions = [
  {
    value: 'collage',
    label: 'Collage',
    preview: (
      <span className="flex size-full flex-col gap-0.5">
        <span className="flex flex-1 gap-0.5">
          <Tile className="grow-3" />
          <Tile className="grow-2" />
        </span>
        <span className="flex flex-1 gap-0.5">
          <Tile className="grow-1" />
          <Tile className="grow-1" />
          <Tile className="grow-1" />
        </span>
      </span>
    ),
  },
  {
    value: 'carousel',
    label: 'Carousel',
    preview: (
      <span className="flex size-full items-center gap-0.5 overflow-hidden">
        <Tile className="h-full w-3/5 shrink-0" />
        <Tile className="h-full w-2/5 shrink-0 opacity-60" />
      </span>
    ),
  },
  {
    value: 'grid',
    label: 'Grid',
    preview: (
      <span className="grid size-full grid-cols-2 grid-rows-2 gap-0.5">
        <Tile />
        <Tile />
        <Tile />
        <Tile />
      </span>
    ),
  },
] as const

const frameOptions = [
  { value: 'card', label: 'Card' },
  { value: 'minimal', label: 'Minimal' },
] as const

function photoCountLabel(count: number) {
  return count === 1 ? '1 photo' : `${count} photos`
}

/**
 * A self-contained moment from a shoot, styled like a social media photo post or quick
 * collection. Photos compose into a flush silhouette with generous breathing room between beats.
 */
function IslandRender({ node, props, update, mode, selected }: BlockRenderProps<'island'>) {
  const assets = useAssets()
  const { gallery, typography } = useResolvedTheme(node.overrides)
  const coverAssetId = useCoverAssetId()
  const items = props.assetIds.map((id) => assets[id]).filter((a): a is Asset => !!a)
  const framed = props.frame === 'card'
  const album = props.layout === 'collage' ? planAlbum(items) : null
  const clipRadius = framed ? Math.max(MIN_CARD_INNER_RADIUS, gallery.roundness) : gallery.roundness
  const outerRadius = clipRadius + CARD_INSET
  const tileRadius = clipRadius
  const maxWidth = islandMeasure(gallery.size, items, props.layout, framed, album)
  const metaParts = [
    props.meta.trim(),
    props.showCount && items.length > 0 ? photoCountLabel(items.length) : '',
  ].filter(Boolean)
  const showHeader = Boolean(props.title.trim() || metaParts.length > 0)
  const showCaption = Boolean(props.caption.trim() || (mode === 'edit' && selected))

  const renderPhoto = (asset: Asset, options: { className?: string; style?: CSSProperties }) => {
    const item = (
      <Photo key={asset.id} asset={asset} className={options.className} style={options.style} />
    )
    if (mode !== 'edit') return item

    return (
      <FileMenu
        key={asset.id}
        asset={asset}
        isCover={asset.id === coverAssetId}
        onRemove={() =>
          update((d) => void (d.assetIds = d.assetIds.filter((id) => id !== asset.id)))
        }
      >
        {item}
      </FileMenu>
    )
  }

  const renderMedia = () => {
    if (items.length === 0) {
      return (
        <div
          className="flex h-44 items-center justify-center border border-dashed border-white/10 px-6 text-center text-small text-fg/50"
          style={{ borderRadius: clipRadius }}
        >
          No photos yet. Pick from the project or upload in the inspector
        </div>
      )
    }

    const layoutProps = {
      items,
      style: gallery,
      clipRadius,
      tileRadius,
      renderPhoto,
    }

    if (props.layout === 'carousel') return <IslandCarousel {...layoutProps} />
    if (props.layout === 'grid') return <IslandGrid {...layoutProps} />

    return (
      <IslandCollage
        album={album}
        style={gallery}
        clipRadius={clipRadius}
        tileRadius={tileRadius}
        renderPhoto={renderPhoto}
      />
    )
  }

  return (
    <div
      className={cn(mode === 'view' ? 'px-4 py-6 sm:px-6 sm:py-10' : 'px-4 py-4')}
      style={typographyStyle(typography)}
    >
      <article
        className={cn(
          'mx-auto w-full',
          framed &&
            'border border-white/8 bg-white/[0.025] p-2 shadow-[0_12px_36px_rgba(0,0,0,0.32)]',
        )}
        style={{ maxWidth, borderRadius: framed ? outerRadius : undefined }}
      >
        {showHeader && (
          <header
            className={cn(
              'flex items-baseline justify-between gap-3',
              framed ? 'px-1.5 pt-1 pb-2.5' : 'pb-3',
            )}
          >
            {props.title.trim() ? (
              <InlineText
                as="h2"
                value={props.title}
                editable={mode === 'edit'}
                noLineBreaks
                placeholder="Moment title"
                onChange={(title) =>
                  update((d) => void (d.title = title), { mergeKey: 'island.title' })
                }
                className="min-w-0 flex-1 text-title font-medium text-fg"
                style={{ fontFamily: 'var(--font-heading)' }}
              />
            ) : (
              <span className="flex-1" />
            )}
            {metaParts.length > 0 && (
              <span className="shrink-0 text-caption text-fg/50 tabular-nums">
                {metaParts.join(' · ')}
              </span>
            )}
          </header>
        )}

        <div
          className={cn(!framed && items.length > 0 && 'ring-1 ring-white/8')}
          style={!framed && items.length > 0 ? { borderRadius: clipRadius } : undefined}
        >
          {renderMedia()}
        </div>

        {showCaption && (
          <div className={cn(framed ? 'px-1.5 pt-2.5 pb-1' : 'pt-3')}>
            <InlineText
              as="p"
              value={props.caption}
              editable={mode === 'edit'}
              placeholder="Write a note about this moment…"
              onChange={(caption) =>
                update((d) => void (d.caption = caption), { mergeKey: 'island.caption' })
              }
              className="text-small text-pretty text-fg/72"
            />
          </div>
        )}
      </article>
    </div>
  )
}

function IslandInspector({ props, update }: BlockInspectorProps<'island'>) {
  return (
    <>
      <Section title="Island">
        <Field label="Layout">
          <TilePicker
            value={props.layout}
            options={layoutOptions}
            columns={3}
            size="sm"
            onChange={(layout) => update((d) => void (d.layout = layout))}
          />
        </Field>
        <Field label="Frame">
          <Segmented
            aria-label="Frame"
            value={props.frame}
            options={frameOptions}
            onChange={(frame) => update((d) => void (d.frame = frame))}
          />
        </Field>
      </Section>

      <Section title="Story">
        <Field label="Title">
          <TextField
            value={props.title}
            placeholder="Moment title"
            onChange={(title) =>
              update((d) => void (d.title = title), { mergeKey: 'island.title' })
            }
          />
        </Field>
        <Field label="Detail">
          <TextField
            value={props.meta}
            placeholder="Time, place or theme"
            onChange={(meta) => update((d) => void (d.meta = meta), { mergeKey: 'island.meta' })}
          />
        </Field>
        <Field label="Caption">
          <TextField
            multiline
            value={props.caption}
            placeholder="Describe this moment"
            onChange={(caption) =>
              update((d) => void (d.caption = caption), { mergeKey: 'island.caption' })
            }
          />
        </Field>
        <SwitchField
          label="Show photo count"
          checked={props.showCount}
          onChange={(showCount) => update((d) => void (d.showCount = showCount))}
        />
      </Section>
    </>
  )
}

function IslandFilesSection({ props, update }: BlockInspectorProps<'island'>) {
  const assets = useAssets()
  const allAssets = Object.values(assets)
  const items = props.assetIds.flatMap((id) => assets[id] ?? [])
  const files = summarizeAssets(items)
  const selectedIds = new Set(props.assetIds)

  const toggleAsset = (id: AssetId) =>
    update((d) => {
      if (d.assetIds.includes(id)) {
        d.assetIds = d.assetIds.filter((existing) => existing !== id)
      } else {
        d.assetIds.push(id)
      }
    })

  const moveAsset = (index: number, delta: number) =>
    update((d) => {
      const target = index + delta
      if (target < 0 || target >= d.assetIds.length) return
      const [moved] = d.assetIds.splice(index, 1)
      if (moved) d.assetIds.splice(target, 0, moved)
    })

  return (
    <Section
      title="Photos"
      count={props.assetIds.length}
      action={
        <div className="flex items-center gap-1">
          {allAssets.length > 0 && (
            <Popover.Root>
              <Popover.Trigger render={<IconButton size="sm" aria-label="Pick from project" />}>
                <ImagePlus className="size-4" />
              </Popover.Trigger>
              <Popover.Popup>
                <ScrollArea
                  scrollbar="plain"
                  className="max-h-72"
                  contentClassName="grid grid-cols-3 gap-1"
                >
                  {allAssets.map((asset) => {
                    const included = selectedIds.has(asset.id)

                    return (
                      <button
                        key={asset.id}
                        type="button"
                        aria-label={`${included ? 'Remove' : 'Add'} ${asset.name}`}
                        aria-pressed={included}
                        onClick={() => toggleAsset(asset.id)}
                        className={cn(
                          'relative aspect-square overflow-hidden rounded-lg outline-offset-2',
                          included && 'outline-2 outline-accent',
                        )}
                      >
                        <Media asset={asset} className="size-full" />
                        {included && (
                          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-accent text-[#0f1c2e]">
                            <Check className="size-3" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </ScrollArea>
              </Popover.Popup>
            </Popover.Root>
          )}
          <UploadButton
            multiple
            iconOnly
            onUploaded={(ids) => update((d) => void d.assetIds.push(...ids))}
          >
            Upload files
          </UploadButton>
        </div>
      }
    >
      {items.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {items.map((asset, index) => (
            <div
              key={asset.id}
              className="group/thumb relative aspect-square overflow-hidden rounded-lg bg-white/3"
            >
              <Media asset={asset} className="size-full" />
              <div className="absolute inset-0 flex items-center justify-center gap-0.5 bg-black/55 opacity-0 transition-opacity group-hover/thumb:opacity-100 focus-within:opacity-100">
                {index > 0 && (
                  <IconButton
                    size="xs"
                    variant="overlay"
                    aria-label="Move earlier"
                    onClick={() => moveAsset(index, -1)}
                  >
                    <ChevronLeft className="size-3" />
                  </IconButton>
                )}
                {index < items.length - 1 && (
                  <IconButton
                    size="xs"
                    variant="overlay"
                    aria-label="Move later"
                    onClick={() => moveAsset(index, 1)}
                  >
                    <ChevronRight className="size-3" />
                  </IconButton>
                )}
                <IconButton
                  size="xs"
                  variant="overlay"
                  aria-label="Remove from island"
                  onClick={() => toggleAsset(asset.id)}
                >
                  <Trash2 className="size-3" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 py-1">
        <StatRow label="Photos" value={files.images} />
        <StatRow label="Videos" value={files.videos} />
        <StatRow label="Size" value={formatBytes(files.bytes)} />
      </div>
    </Section>
  )
}

export const islandBlock = defineBlock({
  type: 'island',
  label: 'Island',
  description: 'A curated moment of photos grouped like a post',
  icon: ImageIcon,
  // v2 added layout, frame and optional story metadata (title, meta, caption, showCount).
  version: 2,
  migrate: (props) => ({ ...DEFAULT_ISLAND_PROPS, ...(props as object) }),
  schema: islandSchema,
  create: () => ({ assetIds: [], ...DEFAULT_ISLAND_PROPS }),
  fromAssets: (assetIds) => ({ assetIds, ...DEFAULT_ISLAND_PROPS }),
  lightboxAssets: (props) => props.assetIds,
  placement: { allowed: ['flow'], initial: () => FLOW },
  themeGroups: ['gallery'],
  Render: IslandRender,
  Inspector: IslandInspector,
  InspectorFooter: IslandFilesSection,
  title: (props) => props.title,
  describe: (node) => ({ meta: String(node.props.assetIds.length), metaIcon: FileIcon }),
})
