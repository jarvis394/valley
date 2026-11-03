import { Download, Info, Trash2 } from 'lucide-react'
import type { ReactElement } from 'react'
import type { Asset } from '../../core/document'
import { formatBytes } from '../../core/format'
import { useRenderContext } from '../../render/context'
import { Media } from '../shared/media'
import { ContextMenu, ImageIcon, LinkIcon, Menu, StatRow } from '@valley/ui'

const fileType = (asset: Asset) => (/\.(\w+)$/.exec(asset.name)?.[1] ?? asset.kind).toUpperCase()

function download(asset: Asset) {
  const link = document.createElement('a')
  link.href = asset.src
  link.download = asset.name
  link.click()
}

/** Right-click menu for a file in a collection. `children` is the file's element. */
export function FileMenu({
  asset,
  isCover,
  onRemove,
  children,
}: {
  asset: Asset
  isCover: boolean
  onRemove: () => void
  children: ReactElement
}) {
  const { setCover } = useRenderContext()
  const size = asset.size === undefined ? null : formatBytes(asset.size)

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger render={children} />
      <ContextMenu.Popup>
        <Menu.Header
          media={<Media asset={asset} />}
          title={asset.name}
          meta={size ? [fileType(asset), size] : [fileType(asset)]}
        />
        {setCover && (
          <Menu.Item icon={<ImageIcon />} disabled={isCover} onClick={() => setCover(asset.id)}>
            Set as cover
          </Menu.Item>
        )}
        <Menu.Item icon={<Download className="size-4" />} onClick={() => download(asset)}>
          Download
        </Menu.Item>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger icon={<Info className="size-4" />}>Info</Menu.SubmenuTrigger>
          <Menu.Popup className="gap-2 py-2.5" sideOffset={8}>
            <StatRow label="Type" value={fileType(asset)} />
            <StatRow label="Dimensions" value={`${asset.width} × ${asset.height}`} />
            {size && <StatRow label="Size" value={size} />}
          </Menu.Popup>
        </Menu.SubmenuRoot>
        <Menu.Item
          icon={<LinkIcon />}
          onClick={() =>
            void navigator.clipboard?.writeText(new URL(asset.src, location.href).href)
          }
        >
          Copy link
        </Menu.Item>
        <Menu.Item variant="danger" icon={<Trash2 className="size-4" />} onClick={onRemove}>
          Delete
        </Menu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Root>
  )
}
