import type { ReactNode } from 'react'
import { cn } from '../cn'

/**
 * Inset rings, so a field's edge never shifts layout or spills past a clipping parent. `quiet`
 * sits on panels; `outlined` stays visible on cards and pages. An invalid control keeps its
 * danger ring through hover and focus.
 */
export const controlRing = {
  quiet:
    'inset-ring inset-ring-transparent not-aria-invalid:hover:not-focus-within:inset-ring-white/7 not-aria-invalid:focus-within:inset-ring-accent aria-invalid:inset-ring-danger',
  outlined:
    'inset-ring inset-ring-white/7 not-aria-invalid:hover:not-focus-within:inset-ring-white/14 not-aria-invalid:focus-within:inset-ring-accent aria-invalid:inset-ring-danger',
} as const

export const controlClass = cn(
  'flex min-h-10 w-full min-w-0 items-center rounded-xl bg-control text-small text-fg',
  controlRing.quiet,
)

export const inputClass = 'min-w-0 flex-1 px-3 py-2.5 outline-none placeholder:text-fg/32'

/** A control that opens something on press (select, picker). */
export const triggerClass = cn(
  controlClass,
  'p-1 text-left outline-none data-popup-open:inset-ring-accent',
)

/** 32px slot for a 16px icon inside a control. Callers mute the icon with its `opacity` prop. */
export function Adornment({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('flex size-8 shrink-0 items-center justify-center', className)}>
      {children}
    </span>
  )
}
