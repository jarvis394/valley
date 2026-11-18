import { cn } from '../cn'

/** Stand-in for content that is still loading; size it with `className`. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('block shrink-0 rounded-md bg-white/7 motion-safe:animate-pulse', className)}
    />
  )
}
