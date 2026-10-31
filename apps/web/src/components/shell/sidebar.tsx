import { useRender } from '@base-ui/react/use-render'
import {
  ChevronRightIcon,
  cn,
  Divider,
  FolderIcon,
  GithubIcon,
  IconButton,
  ListItem,
  LogoIcon,
  Section,
  SwitcherBar,
  SwitcherMenu,
  type IconComponent,
} from '@valley/ui'
import { createContext, use, type ReactElement, type ReactNode } from 'react'

/**
 * The app sidebar. Expanded, it lists rows with labels; collapsed into a 73px rail, the same
 * slots stack icons over captions. Links mark themselves with `aria-current="page"`.
 */
const CollapsedContext = createContext(false)
const useCollapsed = () => use(CollapsedContext)

function Root({ collapsed = false, children }: { collapsed?: boolean; children: ReactNode }) {
  return (
    <CollapsedContext value={collapsed}>
      <nav
        aria-label="App"
        className={cn(
          'flex h-full shrink-0 flex-col overflow-hidden border-r border-line bg-canvas',
          collapsed ? 'w-[73px]' : 'w-[321px]',
        )}
      >
        {children}
      </nav>
    </CollapsedContext>
  )
}

/** 51px plus the divider lines up with the 52px bordered bars of the editor panels. */
function Bar({ children, className }: { children: ReactNode; className?: string }) {
  const collapsed = useCollapsed()
  return (
    <div
      className={cn(
        'flex h-[51px] shrink-0 items-center',
        collapsed ? 'justify-center' : 'gap-3',
        className,
      )}
    >
      {children}
    </div>
  )
}

function SidebarDivider() {
  return <Divider className={useCollapsed() ? 'mx-3' : undefined} />
}

function Account({
  name,
  avatar,
  render,
  menu,
}: {
  name: string
  avatar: string
  render?: ReactElement
  menu?: ReactNode
}) {
  return (
    <>
      <SwitcherBar
        image={avatar}
        label={name}
        render={render}
        compact={useCollapsed()}
        after={menu && <SwitcherMenu label="Switch account">{menu}</SwitcherMenu>}
      />
      <SidebarDivider />
    </>
  )
}

function Nav({ children }: { children: ReactNode }) {
  const collapsed = useCollapsed()
  return (
    <>
      <div className={cn('flex shrink-0 flex-col', collapsed ? 'pb-2' : 'gap-1 px-1.5 py-2')}>
        {children}
      </div>
      <SidebarDivider />
    </>
  )
}

function NavItem({
  icon: Icon,
  label,
  end,
  render,
}: {
  icon: IconComponent
  label: string
  /** Trailing meta, expanded only. */
  end?: ReactNode
  render?: ReactElement
}) {
  if (useCollapsed()) {
    return (
      <RailItem label={label} variant="section" render={render}>
        <Icon />
      </RailItem>
    )
  }
  return <ListItem icon={<Icon />} label={label} end={end} render={render} />
}

/** Project list. Expanded it has a titled header; the rail shows only the scrolling list. */
function Projects({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  if (useCollapsed()) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-1 [scrollbar-width:none]">
        {children}
      </div>
    )
  }
  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-2 [scrollbar-width:none]">
      <Section title={title} action={action} body="list">
        {children}
      </Section>
    </div>
  )
}

/** Header action that opens the full list behind a `Projects` section. */
function ProjectsMore({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <IconButton size="sm" aria-label={label} onClick={onClick}>
      <ChevronRightIcon />
    </IconButton>
  )
}

function ProjectItem({
  label,
  thumbnail,
  render,
}: {
  label: string
  thumbnail?: string
  render?: ReactElement
}) {
  const cover = thumbnail ? (
    <img src={thumbnail} alt="" className="size-full object-cover" />
  ) : (
    <FolderIcon opacity={0.63} />
  )
  if (useCollapsed()) {
    return (
      <RailItem label={label} variant="project" render={render}>
        {cover}
      </RailItem>
    )
  }
  return (
    <ListItem
      leading="media"
      label={label}
      render={render}
      icon={
        <span className="flex size-7 items-center justify-center overflow-hidden rounded-md border-[0.5px] border-white/3 bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
          {cover}
        </span>
      }
    />
  )
}

function Footer({ version, repositoryUrl }: { version: string; repositoryUrl: string }) {
  const collapsed = useCollapsed()
  return (
    <>
      <SidebarDivider />
      <Bar className={collapsed ? undefined : 'pr-1 pl-3'}>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-black text-fg">
          <LogoIcon />
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 text-base leading-6 font-medium">Valley</span>
            <span className="flex items-center gap-1">
              <span className="text-[15px] text-fg/32 tabular-nums">{version}</span>
              <span className="flex p-1.5">
                <IconButton
                  variant="outline"
                  aria-label="Valley on GitHub"
                  render={<a href={repositoryUrl} target="_blank" rel="noreferrer" />}
                >
                  <GithubIcon opacity={0.32} />
                </IconButton>
              </span>
            </span>
          </>
        )}
      </Bar>
    </>
  )
}

const RAIL_VARIANTS = {
  section: {
    item: 'gap-0.5 pt-2 pb-1',
    tile: 'size-8 rounded-lg transition-colors group-hover:bg-white/5 group-aria-[current=page]:bg-white/7',
    label: 'truncate px-1',
  },
  project: {
    item: 'gap-1.5 p-2',
    tile: 'size-10 overflow-hidden rounded-[10px] border-[0.5px] border-white/3 bg-canvas shadow-[0_1px_4px_rgba(0,0,0,0.24)] group-aria-[current=page]:ring-1 group-aria-[current=page]:ring-fg',
    label: 'line-clamp-2 break-words',
  },
} as const

function RailItem({
  label,
  variant,
  render,
  children,
}: {
  label: string
  variant: keyof typeof RAIL_VARIANTS
  render?: ReactElement
  children: ReactNode
}) {
  const styles = RAIL_VARIANTS[variant]
  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...(render ? {} : { type: 'button' }),
      className: cn(
        'group flex shrink-0 flex-col items-center text-fg/63 transition-colors outline-none hover:text-fg aria-[current=page]:text-fg',
        styles.item,
      ),
      children: (
        <>
          <span
            className={cn(
              'flex items-center justify-center group-focus-visible:ring-2 group-focus-visible:ring-accent/60',
              styles.tile,
            )}
          >
            {children}
          </span>
          <span
            className={cn('w-full text-center text-[11px] leading-4 font-medium', styles.label)}
          >
            {label}
          </span>
        </>
      ),
    },
  })
}

export const Sidebar = {
  Root,
  Account,
  Nav,
  NavItem,
  Projects,
  ProjectsMore,
  ProjectItem,
  Footer,
}
