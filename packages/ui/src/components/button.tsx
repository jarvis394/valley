import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../cn'

const VARIANTS = {
  /** Toolbar button with a hairline border (Share). */
  outline: 'border-[0.5px] border-white/7 text-fg hover:bg-white/5',
  /** Bright call to action (Visit). */
  primary:
    'border-[0.5px] border-white/24 bg-linear-to-b from-white to-[#e1e1e1] text-[#1b1b1b] shadow-[0_2px_16px_rgba(255,255,255,0.07),0_0_4px_rgba(255,255,255,0.07)] hover:to-white',
  ghost: 'text-fg hover:bg-white/5',
  /** Full-width panel action (Archive). */
  secondary: 'bg-white/3 text-fg hover:bg-white/7',
  danger: 'bg-danger/12 text-danger hover:bg-danger/18',
  /** Inspector action that sits beside form controls (Upload). */
  control: 'justify-center bg-control text-neutral-200 hover:bg-control-hover',
} as const

const SIZES = {
  sm: 'h-8 gap-2 rounded-[10px] px-3',
  md: 'h-10 gap-2.5 rounded-xl px-4',
} as const

export function Button({
  variant = 'ghost',
  size = 'sm',
  icon,
  className,
  children,
  ...props
}: ComponentProps<'button'> & {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  /** Leading icon; sits in a 14px slot so labels align like in the design. */
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center overflow-hidden text-[15px] leading-5 font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {icon && <span className="-ml-0.5 flex h-4 w-3.5 items-center">{icon}</span>}
      {children}
    </button>
  )
}

const ICON_VARIANTS = {
  default: 'text-fg/63 hover:bg-white/7 hover:text-fg',
  /** Destructive action (Delete). */
  danger: 'text-danger hover:bg-danger/12',
} as const

export function IconButton({
  className,
  size = 'md',
  variant = 'default',
  ...props
}: ComponentProps<'button'> & { size?: 'sm' | 'md'; variant?: keyof typeof ICON_VARIANTS }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-40',
        ICON_VARIANTS[variant],
        size === 'md' ? 'size-8 rounded-[10px]' : 'size-7 rounded-lg',
        className,
      )}
      {...props}
    />
  )
}
