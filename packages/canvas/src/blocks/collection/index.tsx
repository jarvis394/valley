import type { CSSProperties } from 'react'
import { z } from 'zod'
import type { Asset } from '../../core/document'
import { summarizeAssets } from '../../core/assets'
import { formatBytes, middleTruncate } from '../../core/format'
import { assetIdSchema } from '../../core/ids'
import { FLOW } from '../../core/placement'
import { SPACING_PX, type GalleryStyle } from '../../core/theme'
import { useAssets, useCoverAssetId } from '../../render/context'
import { defineBlock, type BlockInspectorProps, type BlockRenderProps } from '../../registry/types'
import { InlineText } from '../shared/inline-text'
import { Media, UploadButton } from '../shared/media'
import { typographyStyle, useResolvedTheme } from '../shared/theme'
import {
  cn,
  Field,
  FileIcon,
  FolderIcon,
  FooterIcon,
  Section,
  StatRow,
  SwitchField,
  TextField,
} from '@valley/ui'

const collectionSchema = z.object({
  title: z.string(),
  showTitle: z.boolean(),
  assetIds: z.array(assetIdSchema),
})
export type CollectionProps = z.infer<typeof collectionSchema>

declare module '../../core/document' {
  interface BlockPropsMap {
    collection: CollectionProps
  }
}

/** Image layouts, keyed by `GalleryStyle['layout']`. To add a layout, add an entry. */
const LAYOUTS: Record<
  Exclude<GalleryStyle['layout'], 'files'>,
  {
    container: (gap: number) => CSSProperties
    containerClass: string
    item: (asset: Asset) => CSSProperties
    itemClass: string
  }
> = {
  grid: {
    containerClass: 'grid grid-cols-2 @lg:grid-cols-4 @4xl:grid-cols-8',
    container: (gap) => ({ gap }),
    itemClass: 'aspect-square',
    item: () => ({}),
  },
  masonry: {
    containerClass: 'columns-2 @lg:columns-3 @4xl:columns-4',
    container: (gap) => ({ columnGap: gap }),
    itemClass: 'break-inside-avoid',
    item: (asset) => ({ aspectRatio: `${asset.width} / ${asset.height}` }),
  },
  horizontal: {
    containerClass: 'flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain',
    container: (gap) => ({ gap, scrollbarWidth: 'none' }),
    itemClass: 'h-64 shrink-0 snap-start sm:h-80',
    item: (asset) => ({ aspectRatio: `${asset.width} / ${asset.height}` }),
  },
}

function CoverBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'absolute flex items-center gap-1.5 overflow-hidden rounded-lg border-[0.5px] border-white/7 bg-surface/80 px-2 py-[5px] text-xs leading-4 font-medium text-[#ededed] shadow-[0_0_0_0.5px_rgba(0,0,0,0.5),inset_0_0_4px_rgba(255,255,255,0.07)] backdrop-blur-[8px]',
        className,
      )}
    >
      <FooterIcon className="size-3" />
      Cover
    </span>
  )
}

/** File-browser card: the image at its natural ratio above the file name. */
function FileCard({ asset, isCover }: { asset: Asset; isCover: boolean }) {
  return (
    <figure className="relative flex aspect-square min-w-0 flex-col items-center gap-2 rounded-2xl px-2 pt-2 pb-1.5 hover:bg-white/3">
      <div className="relative min-h-0 w-full flex-1">
        <Media
          asset={asset}
          className="absolute inset-0 m-auto max-h-full max-w-full rounded-[10px] border-[0.5px] border-white/4 shadow-[0_4px_8px_rgba(0,0,0,0.24),0_0_2px_rgba(0,0,0,0.24)]"
          style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
        />
      </div>
      <figcaption className="-mx-1.5 max-w-[calc(100%+12px)] truncate text-[13px] text-fg/63">
        {middleTruncate(asset.name)}
      </figcaption>
      {isCover && <CoverBadge className="top-0.5 left-0.5" />}
    </figure>
  )
}

function CollectionRender({ node, props, update, mode }: BlockRenderProps<'collection'>) {
  const assets = useAssets()
  const { gallery, typography } = useResolvedTheme(node.overrides)
  // The editor flags the project cover inside collections; viewers don't see the badge.
  const projectCover = useCoverAssetId()
  const coverAssetId = mode === 'edit' ? projectCover : null
  const gap = SPACING_PX[gallery.spacing]
  const items = props.assetIds.map((id) => assets[id]).filter((a): a is Asset => !!a)

  const renderItems = () => {
    if (gallery.layout === 'files') {
      return (
        <div className="grid grid-cols-2 gap-2 @lg:grid-cols-4 @4xl:grid-cols-8">
          {items.map((asset) => (
            <FileCard key={asset.id} asset={asset} isCover={asset.id === coverAssetId} />
          ))}
        </div>
      )
    }
    const layout = LAYOUTS[gallery.layout]
    return (
      <div className={layout.containerClass} style={layout.container(gap)}>
        {items.map((asset) => (
          <figure
            key={asset.id}
            className={cn('group relative overflow-hidden', layout.itemClass)}
            style={{
              ...layout.item(asset),
              borderRadius: gallery.roundness,
              marginBottom: gallery.layout === 'masonry' ? gap : undefined,
            }}
          >
            <Media asset={asset} className="size-full" />
            {mode === 'edit' && (
              <figcaption className="absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-black/70 px-2 pt-6 pb-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {asset.name}
              </figcaption>
            )}
            {asset.id === coverAssetId && <CoverBadge className="top-0.5 right-0.5" />}
          </figure>
        ))}
      </div>
    )
  }

  return (
    <div className="@container px-4 py-2" style={typographyStyle(typography)}>
      {props.showTitle && (
        <InlineText
          as="h2"
          value={props.title}
          editable={mode === 'edit'}
          placeholder="Collection title"
          onChange={(title) =>
            update((d) => void (d.title = title), { mergeKey: 'collection.title' })
          }
          className="mb-4 font-semibold"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'calc(var(--type-scale) * 1.5rem)',
          }}
        />
      )}
      {items.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/7 text-[13px] text-fg/63">
          No files yet. Add some in the inspector
        </div>
      ) : (
        renderItems()
      )}
    </div>
  )
}

function CollectionInspector({ props, update }: BlockInspectorProps<'collection'>) {
  return (
    <Section title="Collection">
      <Field label="Title">
        <TextField
          value={props.title}
          onChange={(title) =>
            update((d) => void (d.title = title), { mergeKey: 'collection.title' })
          }
        />
      </Field>
      <SwitchField
        label="Show title"
        checked={props.showTitle}
        onChange={(showTitle) => update((d) => void (d.showTitle = showTitle))}
      />
    </Section>
  )
}

function CollectionFiles({ props, update }: BlockInspectorProps<'collection'>) {
  const assets = useAssets()
  const files = summarizeAssets(props.assetIds.flatMap((id) => assets[id] ?? []))
  return (
    <Section
      title="Files"
      count={props.assetIds.length}
      action={
        <UploadButton
          multiple
          iconOnly
          onUploaded={(ids) => update((d) => void d.assetIds.push(...ids))}
        >
          Upload files
        </UploadButton>
      }
    >
      <div className="flex flex-col gap-2 py-1">
        <StatRow label="Photos" value={files.images} />
        <StatRow label="Videos" value={files.videos} />
        <StatRow label="Size" value={formatBytes(files.bytes)} />
      </div>
    </Section>
  )
}

export const collectionBlock = defineBlock({
  type: 'collection',
  label: 'Collection',
  icon: FolderIcon,
  version: 1,
  schema: collectionSchema,
  create: ({ doc }) => ({
    title: 'Collection',
    showTitle: false,
    assetIds: Object.values(doc.assets)
      .filter((a) => a.kind === 'image')
      .map((a) => a.id),
  }),
  fromAssets: (assetIds) => ({ title: 'Collection', showTitle: false, assetIds }),
  placement: { allowed: ['flow'], initial: () => FLOW },
  themeGroups: ['gallery'],
  Render: CollectionRender,
  Inspector: CollectionInspector,
  InspectorFooter: CollectionFiles,
  title: (props) => props.title,
  describe: (node) => ({ meta: String(node.props.assetIds.length), metaIcon: FileIcon }),
})
