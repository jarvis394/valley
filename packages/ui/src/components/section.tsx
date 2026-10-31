import { History } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../cn'
import { IconButton } from './button'

export function Section({
  title,
  onReset,
  action,
  children,
  className,
}: {
  title: string
  /** When provided, a reset button is shown (e.g. "this overrides the project style"). */
  onReset?: () => void
  /** Extra control at the end of the header. */
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col', className)}>
      <header className="flex items-center gap-2 pt-2.5 pr-3 pb-1.5 pl-4">
        <h3 className="flex h-7 min-w-0 flex-1 items-center text-[15px] leading-5 font-medium text-fg">
          {title}
        </h3>
        {onReset && (
          <IconButton size="sm" onClick={onReset} aria-label="Reset to project style">
            <History className="size-4" />
          </IconButton>
        )}
        {action}
      </header>
      <div className="flex flex-col gap-2.5 px-2">{children}</div>
    </section>
  )
}

export function Field({
  label,
  description,
  children,
  className,
}: {
  label?: string
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      {label && <span className="truncate px-2 text-[11px] leading-3.5 text-fg/63">{label}</span>}
      {children}
      {description && (
        <p className="px-2 text-[11px] leading-4 text-pretty text-fg/63">{description}</p>
      )}
    </div>
  )
}

/** Label/value line, e.g. project statistics. */
export function StatRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-2 text-[13px] leading-5 text-fg">
      <span className="min-w-0 flex-1 truncate text-fg/63">{label}</span>
      <span className="shrink-0 truncate tabular-nums">{value}</span>
    </div>
  )
}
