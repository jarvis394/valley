import type { ReactNode } from 'react'
import { cn } from '../cn'

const BODY = {
  /** Inspector fields. */
  form: 'gap-2.5 px-2',
  /** `ListItem` rows (recent projects). */
  list: 'gap-1 px-1.5',
} as const

export function Section({
  title,
  count,
  action,
  body = 'form',
  children,
  className,
}: {
  title: string
  /** Secondary number after the title, e.g. how many items the section holds. */
  count?: number
  /** Extra control at the end of the header. */
  action?: ReactNode
  body?: keyof typeof BODY
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col', className)}>
      <header className="flex items-center gap-2 pt-2.5 pr-3 pb-1.5 pl-4">
        <h3 className="flex h-7 min-w-0 flex-1 items-center text-body font-medium text-fg">
          <span className="truncate">{title}</span>
          {count !== undefined && (
            <span className="ml-2 shrink-0 text-fg/32 tabular-nums">{count}</span>
          )}
        </h3>
        {action}
      </header>
      <div className={cn('flex flex-col', BODY[body])}>{children}</div>
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
      {label && <span className="truncate px-2 text-caption leading-3.5 text-fg/63">{label}</span>}
      {children}
      {description && <p className="px-2 text-caption text-pretty text-fg/63">{description}</p>}
    </div>
  )
}

/** Label/value line, e.g. project statistics. */
export function StatRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-2 text-small text-fg">
      <span className="min-w-0 flex-1 truncate text-fg/63">{label}</span>
      <span className="shrink-0 truncate tabular-nums">{value}</span>
    </div>
  )
}
