import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../cn'

/**
 * 40px panel row: icon, label and trailing meta (outline blocks, project navigation).
 * Lists space rows with `gap-1`; the `before` hit area spans half that gap on each side.
 */
export function ListItem({
  icon,
  label,
  end,
  selected,
  className,
  ...props
}: Omit<ComponentProps<'button'>, 'children'> & {
  icon?: ReactNode
  label: ReactNode
  end?: ReactNode
  selected?: boolean
}) {
  return (
    <button
      type="button"
      data-selected={selected || undefined}
      className={cn(
        'group/item relative flex h-10 w-full shrink-0 items-center gap-1 rounded-xl px-3 text-left text-[15px] leading-5 font-medium text-fg transition-colors outline-none hover:bg-white/3 focus-visible:ring-2 focus-visible:ring-accent/60 before:absolute before:inset-x-0 before:-inset-y-0.5',
        selected && 'bg-selected text-selected-fg hover:bg-selected',
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        {icon && (
          <span className={cn('flex shrink-0', selected ? 'text-selected-fg' : 'text-fg/63')}>
            {icon}
          </span>
        )}
        <span className="fade-x min-w-0 flex-1">{label}</span>
      </span>
      {end}
    </button>
  )
}

/** Muted trailing text for a `ListItem` (counts, sizes). */
export function ListItemMeta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-1 pl-1 font-normal tabular-nums',
        'text-fg/64 group-data-selected/item:text-selected-fg',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Small pill, e.g. "2 new". */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-selected px-2 py-0.75 text-[13px] leading-4.25 font-medium text-info-fg">
      {children}
    </span>
  )
}
