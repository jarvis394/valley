import type { ComponentProps } from 'react'
import { z } from 'zod'
import type { Asset } from '../../core/document'
import { summarizeAssets } from '../../core/assets'
import { formatBytes, middleTruncate } from '../../core/format'
import { assetIdSchema } from '../../core/ids'
import { FLOW } from '../../core/placement'
import { useAssets, useCoverAssetId } from '../../render/context'
import { defineBlock, type BlockInspectorProps, type BlockRenderProps } from '../../registry/types'
import { InlineText } from '../shared/inline-text'
import { Media, UploadButton } from '../shared/media'
import { textStyleCss, typographyStyle, useResolvedTheme } from '../shared/theme'
import { FileMenu } from './file-menu'
import { GalleryLayout } from './layouts'
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

function CoverBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'absolute flex items-center gap-1.5 overflow-hidden rounded-lg border-[0.5px] border-white/7 bg-surface/80 px-2 py-1.25 text-label font-medium text-[#ededed] shadow-[0_0_0_0.5px_rgba(0,0,0,0.5),inset_0_0_4px_rgba(255,255,255,0.07)] backdrop-blur-sm',
        className,
      )}
    >
      <FooterIcon className="size-3" />
      Cover
    </span>
  )
}

/** File-browser card: the image at its natural ratio above the file name. */
function FileCard({
  asset,
  isCover,
  className,
  ...props
}: ComponentProps<'figure'> & { asset: Asset; isCover: boolean }) {
  return (
    <figure
      className={cn(
        'relative flex aspect-square min-w-0 flex-col items-center gap-2 rounded-2xl px-2 pt-2 pb-1.5 hover:bg-white/3 data-popup-open:bg-white/7',
        className,
      )}
      {...props}
    >
      <div className="relative min-h-0 w-full flex-1">
        <Media
          asset={asset}
          className="absolute inset-0 m-auto max-h-full max-w-full rounded-[10px] border-[0.5px] border-white/4 shadow-[0_4px_8px_rgba(0,0,0,0.24),0_0_2px_rgba(0,0,0,0.24)]"
          style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
        />
      </div>
      <figcaption className="-mx-1.5 max-w-[calc(100%+12px)] truncate text-small text-fg/63">
        {middleTruncate(asset.name)}
      </figcaption>
      {isCover && <CoverBadge className="top-0.5 left-0.5" />}
    </figure>
  )
}

function CollectionRender({ node, props, update, mode }: BlockRenderProps<'collection'>) {
  const assets = useAssets()
  const { gallery, typography } = useResolvedTheme(node.overrides)
  const coverAssetId = useCoverAssetId()
  const items = props.assetIds.map((id) => assets[id]).filter((a): a is Asset => !!a)

  // The editor shows files to manage; the preview and published page show the real layout.
  const renderItems = () =>
    mode === 'edit' ? (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(--spacing(28),1fr))] gap-2">
        {items.map((asset) => (
          <FileMenu
            key={asset.id}
            asset={asset}
            isCover={asset.id === coverAssetId}
            onRemove={() =>
              update((d) => void (d.assetIds = d.assetIds.filter((id) => id !== asset.id)))
            }
          >
            <FileCard asset={asset} isCover={asset.id === coverAssetId} />
          </FileMenu>
        ))}
      </div>
    ) : (
      <GalleryLayout items={items} style={gallery} />
    )

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
          className="mb-4"
          style={textStyleCss(typography.heading)}
        />
      )}
      {items.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/7 text-small text-fg/63">
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
