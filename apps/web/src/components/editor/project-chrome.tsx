import { useEditor } from '@valley/canvas'
import {
  AnalyticsIcon,
  Badge,
  Button,
  ChevronDownSmallIcon,
  ExternalIcon,
  EyeIcon,
  GlobeIcon,
  HeartIcon,
  ImageIcon,
  ListItem,
  ListItemMeta,
  ShareIcon,
} from '@valley/ui'
import { formatCompact } from '../../lib/format'
import { useCopyText } from '../../lib/use-copy-text'

/** Project-level links under the "Project" row. */
export function ProjectNav({ views, newFavorites }: { views: number; newFavorites: number }) {
  return (
    <>
      <ListItem icon={<ImageIcon />} label="Retouch" />
      <ListItem
        icon={<AnalyticsIcon />}
        label="Analytics"
        end={
          <ListItemMeta>
            {formatCompact(views)}
            <EyeIcon opacity={0.3} />
          </ListItemMeta>
        }
      />
      <ListItem
        icon={<HeartIcon />}
        label={
          <span className="flex items-center gap-3">
            Favorites {newFavorites > 0 && <Badge>{newFavorites} new</Badge>}
          </span>
        }
      />
    </>
  )
}

/** Toolbar above the inspector: language, share link and preview. */
export function ProjectActions() {
  const editor = useEditor()
  const { copied, copy } = useCopyText()

  const share = () => copy(`${editor.galleryUrl}/${editor.getState().settings.slug ?? ''}`)

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center">
        <Button variant="ghost" size="compact" aria-label="Language">
          <GlobeIcon />
          <ChevronDownSmallIcon />
        </Button>
      </div>
      <Button variant="outline" icon={<ShareIcon />} onClick={share}>
        {copied ? 'Copied' : 'Share'}
      </Button>
      <Button variant="primary" icon={<ExternalIcon />} onClick={() => editor.setMode('preview')}>
        Visit
      </Button>
    </>
  )
}
