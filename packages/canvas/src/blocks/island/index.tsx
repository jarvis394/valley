import { z } from 'zod'
import type { Asset } from '../../core/document'
import { assetIdSchema } from '../../core/ids'
import { FLOW } from '../../core/placement'
import type { GalleryStyle } from '../../core/theme'
import { useAssets, useCoverAssetId } from '../../render/context'
import { defineBlock, type BlockRenderProps } from '../../registry/types'
import { FileMenu } from '../collection/file-menu'
import { FilesSection } from '../collection'
import { Photo } from '../shared/photo'
import { useResolvedTheme } from '../shared/theme'
import { FileIcon, ImageIcon } from '@valley/ui'

const islandSchema = z.object({
  assetIds: z.array(assetIdSchema),
})

export type IslandProps = z.infer<typeof islandSchema>

declare module '../../core/document' {
  interface BlockPropsMap {
    island: IslandProps
  }
}

/** Width of one column: a 2:3 portrait at the row height. Landscapes span two columns. */
const columnWidth = (style: GalleryStyle) => (style.size * 2) / 3

function itemWidth(asset: Asset, style: GalleryStyle) {
  const span = asset.width > asset.height ? 2 : 1

  return span * columnWidth(style) + (span - 1) * style.spacing
}

/**
 * A small group of photos that belong together. Items sit on a shared column grid, so
 * consecutive islands line up, and are cropped to fill their cells.
 */
function IslandRender({ node, props, update, mode }: BlockRenderProps<'island'>) {
  const assets = useAssets()
  const { gallery } = useResolvedTheme(node.overrides)
  const coverAssetId = useCoverAssetId()
  const items = props.assetIds.map((id) => assets[id]).filter((a): a is Asset => !!a)

  const renderItem = (asset: Asset) => {
    const item = (
      <Photo
        key={asset.id}
        asset={asset}
        className="max-w-full shrink-0"
        style={{
          width: itemWidth(asset, gallery),
          height: gallery.size,
          borderRadius: gallery.roundness,
        }}
      />
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

  return (
    <div className="px-4 py-2">
      {items.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/7 text-small text-fg/63">
          No files yet. Add some in the inspector
        </div>
      ) : (
        <div className="flex flex-wrap" style={{ gap: gallery.spacing }}>
          {items.map(renderItem)}
        </div>
      )}
    </div>
  )
}

export const islandBlock = defineBlock({
  type: 'island',
  label: 'Island',
  description: 'A few photos kept together',
  icon: ImageIcon,
  version: 1,
  schema: islandSchema,
  create: () => ({ assetIds: [] }),
  fromAssets: (assetIds) => ({ assetIds }),
  lightboxAssets: (props) => props.assetIds,
  placement: { allowed: ['flow'], initial: () => FLOW },
  themeGroups: ['gallery'],
  Render: IslandRender,
  InspectorFooter: FilesSection,
  describe: (node) => ({ meta: String(node.props.assetIds.length), metaIcon: FileIcon }),
})
