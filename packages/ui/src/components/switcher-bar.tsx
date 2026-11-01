import { useRender } from '@base-ui/react/use-render'
import type { ReactElement, ReactNode } from 'react'
import { cn } from '../cn'
import { MenuExpandIcon } from '../icons'
import { IconButton } from './button'
import { Menu } from './overlays'

/**
 * A panel's top bar: image and title, optionally linking somewhere as a whole, with an end slot
 * above the link. Compact shows the image alone.
 */
export function SwitcherBar({
  image,
  label,
  render,
  compact = false,
  after,
}: {
  image?: string
  label: string
  /** Makes the whole bar, except the end slot, this element (e.g. a router link). */
  render?: ReactElement
  compact?: boolean
  /** End slot, hidden when compact; a `bar` size button there gets a hit area as tall as the bar. */
  after?: ReactNode
}) {
  const content = useRender({
    render,
    defaultTagName: 'span',
    props: {
      className: cn(
        'flex min-w-0 flex-1 items-center self-stretch outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-accent/60 focus-visible:after:ring-inset',
        compact ? 'justify-center' : 'gap-3',
      ),
      children: (
        <>
          {image ? (
            <img
              src={image}
              alt={compact ? label : ''}
              className="size-7 shrink-0 rounded-md border-[0.5px] border-white/4 object-cover"
            />
          ) : (
            <span className="size-7 shrink-0 rounded-md bg-white/7" />
          )}
          {!compact && (
            <span className="min-w-0 flex-1 truncate text-title font-medium">{label}</span>
          )}
        </>
      ),
    },
  })

  return (
    <div
      className={cn(
        'relative flex h-12.75 shrink-0 items-center [--hit-area:51px]',
        !compact && 'px-3',
      )}
    >
      {content}
      {!compact && after && <span className="relative z-10 flex">{after}</span>}
    </div>
  )
}

/** Switcher trigger and its menu, for `SwitcherBar`'s `after` slot. */
export function SwitcherMenu({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Menu.Root>
      <Menu.Trigger render={<IconButton size="bar" aria-label={label} />}>
        <MenuExpandIcon />
      </Menu.Trigger>
      <Menu.Popup align="end" sideOffset={12}>
        {children}
      </Menu.Popup>
    </Menu.Root>
  )
}
