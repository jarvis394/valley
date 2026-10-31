import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../cn'

const pressable =
  'inline-flex shrink-0 items-center outline-none transition-[color,background-color,border-color,scale] duration-150 ease-out select-none focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-97 disabled:pointer-events-none disabled:opacity-40'

const VARIANTS = {
  /** Toolbar button with a hairline border (Share). */
  outline: 'border-[0.5px] border-white/7 text-fg hover:bg-white/5 data-popup-open:bg-white/7',
  /** Bright call to action (Visit). */
  primary:
    'border-[0.5px] border-white/24 bg-linear-to-b from-white to-[#e1e1e1] text-[#1b1b1b] shadow-[0_2px_16px_rgba(255,255,255,0.07),0_0_4px_rgba(255,255,255,0.07)] hover:to-white',
  ghost: 'text-fg hover:bg-white/5 data-popup-open:bg-white/7',
  /** Full-width panel action (Archive). */
  secondary: 'bg-white/3 text-fg hover:bg-white/7',
  danger: 'bg-danger/12 text-danger hover:bg-danger/18',
  /** Inspector action that sits beside form controls (Upload). */
  control:
    'justify-center bg-control text-neutral-200 hover:bg-control-hover data-popup-open:bg-control-hover',
} as const

const SIZES = {
  sm: 'h-8 gap-2 rounded-[10px] px-3',
  md: 'h-10 gap-2.5 rounded-xl px-4',
  /** `sm` height for icon-only content, e.g. an icon with a dropdown chevron (Language). */
  compact: 'h-8 gap-1 rounded-[10px] px-2',
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
        pressable,
        'overflow-hidden text-[15px] leading-5 font-medium whitespace-nowrap',
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
  /** Fades the icon element rather than its color, so overlapping strokes stay even. */
  default:
    'text-fg *:opacity-63 *:transition-opacity hover:bg-white/5 hover:*:opacity-100 data-popup-open:bg-white/7 data-popup-open:*:opacity-100',
  /** Destructive action (Delete). */
  danger: 'text-danger hover:bg-danger/12',
} as const

/** Square counterparts of `Button` sizes; `lg` sits beside 40px form controls. */
const ICON_SIZES = {
  sm: 'size-7 rounded-lg',
  /** `sm` look with a 44px square hit area, for the trailing action of a panel header bar. */
  bar: 'relative size-7 rounded-lg before:absolute before:-inset-2',
  md: 'size-8 rounded-[10px]',
  lg: 'size-10 rounded-xl',
} as const

export function IconButton({
  className,
  size = 'md',
  variant = 'default',
  ...props
}: ComponentProps<'button'> & {
  size?: keyof typeof ICON_SIZES
  variant?: keyof typeof ICON_VARIANTS
}) {
  return (
    <button
      type="button"
      className={cn(
        pressable,
        'justify-center',
        ICON_VARIANTS[variant],
        ICON_SIZES[size],
        className,
      )}
      {...props}
    />
  )
}
