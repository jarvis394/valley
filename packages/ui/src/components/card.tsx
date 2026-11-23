import type { ReactNode } from 'react'
import { cn } from '../cn'
import { FormError } from './field'
import { hairline } from './styles'

/** Surface for a stack of `CardRow`s, which own the padding; `divided` rules them apart. */
export function Card({
  divided = false,
  className,
  children,
}: {
  divided?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface',
        hairline,
        divided && 'divide-y divide-white/7',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Settings-style row: optional leading media, a label with its description, and trailing
 * actions that wrap below the text when the row is narrow.
 */
export function CardRow({
  leading,
  label,
  description,
  error,
  children,
}: {
  leading?: ReactNode
  label: ReactNode
  description?: ReactNode
  /** Shown under the description, e.g. when an action in the row failed. */
  error?: string
  /** Trailing actions. */
  children?: ReactNode
}) {
  return (
    <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3">
      {leading}
      <div className="flex min-w-40 flex-1 flex-col gap-1">
        <div className="min-w-0">
          <div className="truncate text-body font-medium text-fg">{label}</div>
          {description && <div className="text-small text-fg/63">{description}</div>}
        </div>
        <FormError message={error} gap={1} />
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  )
}
