import type { ReactNode } from 'react'
import { cn } from '../cn'

const pill = 'rounded-full px-2 py-0.75 font-medium'

const VARIANTS = {
  /** Count of something new ("2 new"). */
  info: cn(pill, 'bg-selected text-small leading-4.25 text-info-fg'),
  neutral: cn(pill, 'bg-white/7 text-caption leading-4 text-fg/63'),
  danger: cn(pill, 'bg-danger/12 text-caption leading-4 text-danger'),
  success: cn(pill, 'bg-emerald-400/12 text-caption leading-4 text-emerald-300'),
  /** Small caps tag for unfinished features ("beta"). */
  warning: 'rounded bg-amber-400/15 px-1.5 py-0.5 text-caption text-amber-300 uppercase',
} as const

export function Badge({
  variant = 'info',
  children,
}: {
  variant?: keyof typeof VARIANTS
  children: ReactNode
}) {
  return <span className={cn('shrink-0', VARIANTS[variant])}>{children}</span>
}
