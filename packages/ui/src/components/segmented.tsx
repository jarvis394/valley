import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import type { ReactNode } from 'react'
import { cn } from '../cn'

export interface Option<T> {
  value: T
  label: ReactNode
  title?: string
}

const keyOf = (value: unknown) => String(value)

/** Single-choice segmented control. Values may be strings or numbers. */
export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  className,
  'aria-label': ariaLabel,
}: {
  value: T
  options: readonly Option<T>[]
  onChange: (value: T) => void
  className?: string
  'aria-label'?: string
}) {
  return (
    <ToggleGroup
      aria-label={ariaLabel}
      value={[keyOf(value)]}
      onValueChange={([next]) => {
        const option = options.find((o) => keyOf(o.value) === next)
        if (option) onChange(option.value)
      }}
      className={cn('flex gap-1 rounded-xl bg-control p-1', className)}
    >
      {options.map((option) => (
        <Toggle
          key={keyOf(option.value)}
          value={keyOf(option.value)}
          title={option.title}
          className="group flex h-8 min-w-0 flex-1 items-center justify-center rounded-[10px] px-2 text-small text-fg outline-none select-none focus-visible:ring-2 focus-visible:ring-accent/60 data-pressed:bg-white/7"
        >
          <span className="flex min-w-0 items-center opacity-63 group-hover:opacity-100 group-data-pressed:opacity-100">
            {option.label}
          </span>
        </Toggle>
      ))}
    </ToggleGroup>
  )
}

const PREVIEW_SIZES = {
  /** Fills the tile, for drawings with detail (cover variants). */
  md: 'w-full p-1',
  /** An icon-sized glyph above the label. */
  sm: 'w-12 p-0.75',
} as const

/** Tiles with a preview drawing, e.g. cover variants. */
export function TilePicker<T extends string>({
  value,
  options,
  onChange,
  columns = 3,
  size = 'md',
}: {
  value: T
  options: readonly (Option<T> & { preview: ReactNode })[]
  onChange: (value: T) => void
  columns?: number
  size?: keyof typeof PREVIEW_SIZES
}) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={([next]) => next && onChange(next as T)}
      className="grid gap-1 rounded-xl bg-control p-1"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className="group flex flex-col items-center gap-1.5 rounded-[10px] p-2 text-caption text-fg/63 outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-accent/60 data-pressed:bg-white/7 data-pressed:text-fg"
        >
          <span
            className={cn(
              'flex aspect-[8/5] items-center justify-center rounded-md border border-current text-micro tracking-wider',
              PREVIEW_SIZES[size],
            )}
          >
            {option.preview}
          </span>
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  )
}
