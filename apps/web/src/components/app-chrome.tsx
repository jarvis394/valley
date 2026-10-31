import { useEditor } from '@valley/canvas'
import {
  AnalyticsIcon,
  Badge,
  Button,
  ChevronDownSmallIcon,
  cn,
  Divider,
  ExternalIcon,
  EyeIcon,
  FolderIcon,
  GlobeIcon,
  HeartIcon,
  ImageIcon,
  ListItem,
  ListItemMeta,
  LogoIcon,
  PortfolioIcon,
  ProjectsIcon,
  SettingsIcon,
  ShareIcon,
} from '@valley/ui'
import { useRef, useState, type ReactNode } from 'react'
import { GALLERY_SERVICE_URL } from '../config/constants'

// Static demo content until the workspace (projects, analytics, sharing) has a backend.

const SECTIONS = [
  { label: 'Projects', icon: ProjectsIcon, current: true },
  { label: 'Portfolio', icon: PortfolioIcon },
  { label: 'Analytics', icon: AnalyticsIcon },
  { label: 'Settings', icon: SettingsIcon },
]

const PROJECTS = [
  { label: 'August in Europe' },
  { label: 'Stockholm 2026', thumbnail: '/demo/stockholm-34.jpg', current: true },
  { label: 'Oulu', thumbnail: '/demo/project-oulu.jpg' },
  { label: 'Oulu’s Winter', thumbnail: '/demo/project-oulu-winter.jpg' },
  { label: 'Saint-Petersburg', thumbnail: '/demo/project-saint-petersburg.jpg' },
]

const RAIL_VARIANTS = {
  section: {
    item: 'gap-0.5 pt-2 pb-1',
    tile: 'size-8 rounded-lg transition-colors group-hover:bg-white/5 group-data-current:bg-white/7',
    label: 'truncate px-1',
  },
  project: {
    item: 'gap-1.5 p-2',
    tile: 'size-10 overflow-hidden rounded-[10px] border-[0.5px] border-white/3 bg-canvas shadow-[0_1px_4px_rgba(0,0,0,0.24)] group-data-current:ring-1 group-data-current:ring-fg',
    label: 'line-clamp-2 break-words',
  },
} as const

function RailItem({
  label,
  current,
  variant,
  children,
}: {
  label: string
  current?: boolean
  variant: keyof typeof RAIL_VARIANTS
  children: ReactNode
}) {
  const styles = RAIL_VARIANTS[variant]
  return (
    <button
      type="button"
      aria-current={current ? 'page' : undefined}
      data-current={current || undefined}
      className={cn(
        'group flex shrink-0 flex-col items-center text-fg/63 transition-colors outline-none hover:text-fg data-current:text-fg',
        styles.item,
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center group-focus-visible:ring-2 group-focus-visible:ring-accent/60',
          styles.tile,
        )}
      >
        {children}
      </span>
      <span className={cn('w-full text-center text-[11px] leading-4 font-medium', styles.label)}>
        {label}
      </span>
    </button>
  )
}

export function AppSidebar() {
  return (
    <nav className="flex h-full w-[73px] shrink-0 flex-col border-r border-line bg-canvas">
      <div className="flex h-[52px] shrink-0 items-center justify-center">
        <img
          src="/demo/user.jpg"
          alt="Account"
          className="size-7 rounded-md border-[0.5px] border-white/4 object-cover"
        />
      </div>
      <Divider className="mx-3" />
      <div className="flex shrink-0 flex-col pb-2">
        {SECTIONS.map(({ label, icon: Icon, current }) => (
          <RailItem key={label} label={label} current={current} variant="section">
            <Icon />
          </RailItem>
        ))}
      </div>
      <Divider className="mx-3" />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-1 [scrollbar-width:none]">
        {PROJECTS.map(({ label, thumbnail, current }) => (
          <RailItem key={label} label={label} current={current} variant="project">
            {thumbnail ? (
              <img src={thumbnail} alt="" className="size-full object-cover" />
            ) : (
              <FolderIcon />
            )}
          </RailItem>
        ))}
      </div>
      <Divider className="mx-3" />
      <div className="flex shrink-0 justify-center px-2 py-3">
        <span className="flex size-7 items-center justify-center rounded-md bg-black text-fg">
          <LogoIcon />
        </span>
      </div>
    </nav>
  )
}

export function ProjectNav() {
  return (
    <>
      <ListItem icon={<ImageIcon />} label="Retouch" />
      <ListItem
        icon={<AnalyticsIcon />}
        label="Analytics"
        end={
          <ListItemMeta>
            12.4k
            <EyeIcon className="text-fg/30" />
          </ListItemMeta>
        }
      />
      <ListItem
        icon={<HeartIcon />}
        label={
          <span className="flex items-center gap-3">
            Favorites <Badge>2 new</Badge>
          </span>
        }
      />
    </>
  )
}

export function ProjectActions() {
  const editor = useEditor()
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const share = async () => {
    const { slug } = editor.getState().settings
    await navigator.clipboard?.writeText(`${GALLERY_SERVICE_URL}/${slug ?? ''}`)
    setCopied(true)
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(false), 1500)
  }
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
