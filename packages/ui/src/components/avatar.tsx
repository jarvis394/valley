import { Avatar as BaseAvatar } from '@base-ui/react/avatar'
import { cn } from '../cn'
import { hairline } from './styles'

const SIZES = {
  sm: 'size-7 rounded-md text-caption',
  md: 'size-9 rounded-lg text-small',
  lg: 'size-16 rounded-2xl text-heading',
} as const

export function Avatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string | null
  name: string
  size?: keyof typeof SIZES
  className?: string
}) {
  const initial = name.trim().slice(0, 1).toUpperCase() || '?'

  return (
    <BaseAvatar.Root
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden bg-white/7 font-medium text-fg/63 select-none',
        hairline,
        SIZES[size],
        className,
      )}
    >
      {src && (
        <BaseAvatar.Image
          src={src}
          alt=""
          className="size-full object-cover transition-opacity duration-300 ease-out data-starting-style:opacity-0 motion-reduce:transition-none"
        />
      )}
      <BaseAvatar.Fallback delay={src ? 600 : undefined}>{initial}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  )
}
