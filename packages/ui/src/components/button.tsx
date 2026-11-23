import { useRender } from '@base-ui/react/use-render'
import { Loader2 } from 'lucide-react'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { cn } from '../cn'
import { buttonType, focusRing, hairline } from './styles'

const pressable = cn(
  'inline-flex shrink-0 items-center select-none active:scale-97 disabled:pointer-events-none disabled:opacity-40',
  focusRing,
)

const VARIANTS = {
  /** Toolbar button with a hairline border (Share); its icon is muted until hovered. */
  outline: cn(
    hairline,
    'text-fg hover:bg-white/5 data-popup-open:bg-white/7 *:data-icon:opacity-63 hover:*:data-icon:opacity-100 data-popup-open:*:data-icon:opacity-100',
  ),
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
  /** Form submit, usually stretched to the form's width, so its label is centred. */
  lg: 'h-11 justify-center gap-2.5 rounded-xl px-5',
  /** `sm` height for icon-only content, e.g. an icon with a dropdown chevron (Language). */
  compact: 'h-8 gap-1 rounded-[10px] px-2',
} as const

export function Button({
  variant = 'ghost',
  size = 'sm',
  icon,
  loading = false,
  disabled,
  render,
  className,
  children,
  ...props
}: ComponentProps<'button'> & {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  /** Leading icon; sits in a 14px slot so labels align like in the design. */
  icon?: ReactNode
  /** Swaps the icon for a spinner; without an icon, the spinner covers the label so the width holds. */
  loading?: boolean
  render?: ReactElement
}) {
  const spinner = <Loader2 className="size-4 animate-spin" />
  const covered = loading && !icon

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...buttonType(render),
      ...props,
      disabled: disabled || loading,
      'aria-busy': loading || undefined,
      className: cn(
        pressable,
        'relative overflow-hidden text-body font-medium whitespace-nowrap',
        SIZES[size],
        VARIANTS[variant],
        className,
      ),
      children: (
        <>
          {icon && (
            <span data-icon className="-ml-0.5 flex h-4 w-3.5 items-center">
              {loading ? spinner : icon}
            </span>
          )}
          {covered ? (
            <>
              <span className="invisible">{children}</span>
              <span className="absolute inset-0 flex items-center justify-center">{spinner}</span>
            </>
          ) : (
            children
          )}
        </>
      ),
    },
  })
}

/** Inline text action inside copy ("Use another email"). */
export function LinkButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'rounded text-body font-medium text-accent underline-offset-4 hover:underline disabled:opacity-40',
        focusRing,
        className,
      )}
      {...props}
    />
  )
}

const ICON_VARIANTS = {
  /** Fades the icon element rather than its color, so overlapping strokes stay even. */
  default:
    'text-fg *:opacity-63 hover:bg-white/5 hover:*:opacity-100 data-popup-open:bg-white/7 data-popup-open:*:opacity-100',
  /** Hairline-bordered counterpart of `Button`'s `outline` (copy link, card menus). */
  outline: cn(
    hairline,
    'text-fg *:opacity-63 hover:bg-white/5 hover:*:opacity-100 data-popup-open:bg-white/7 data-popup-open:*:opacity-100',
  ),
  /** Destructive action (Delete). */
  danger: 'text-danger hover:bg-danger/12',
  /** Sits on photos: a dark blurred fill keeps the icon legible over any image. */
  overlay: 'bg-black/32 text-fg backdrop-blur-md hover:bg-black/48',
  /** Tertiary action that stays out of the way until hovered (block toolbar). */
  dimmed:
    'text-fg *:opacity-32 hover:bg-white/7 hover:*:opacity-100 data-popup-open:bg-white/7 data-popup-open:*:opacity-100',
} as const

/** Square counterparts of `Button` sizes; `lg` sits beside 40px form controls. */
const ICON_SIZES = {
  /** For a 12px icon in a dense toolbar. */
  xs: 'size-4.5 rounded',
  sm: 'size-7 rounded-lg',
  /**
   * `sm` look with a square hit area for a header bar's trailing action. The area is `--hit-area`
   * (44px by default) and centred on the button, so it survives the press scale.
   */
  bar: 'relative size-7 rounded-lg before:absolute before:top-1/2 before:left-1/2 before:size-(--hit-area,44px) before:-translate-1/2',
  md: 'size-8 rounded-[10px]',
  lg: 'size-10 rounded-xl',
} as const

/** `render` swaps the button for another element, such as an external link. */
export function IconButton({
  className,
  size = 'md',
  variant = 'default',
  render,
  ...props
}: ComponentProps<'button'> & {
  size?: keyof typeof ICON_SIZES
  variant?: keyof typeof ICON_VARIANTS
  render?: ReactElement
}) {
  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...buttonType(render),
      ...props,
      className: cn(
        pressable,
        'justify-center',
        ICON_VARIANTS[variant],
        ICON_SIZES[size],
        className,
      ),
    },
  })
}

/**
 * Joins adjacent buttons: inner corners tighten, outer ones keep the button radius.
 * It overrides the radius of its own children, hence the important modifiers.
 */
export function ButtonGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="group"
      className={cn(
        'flex items-center gap-1 *:rounded-md! *:first:rounded-l-[10px]! *:last:rounded-r-[10px]!',
        className,
      )}
      {...props}
    />
  )
}
