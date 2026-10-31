import type { ComponentProps } from 'react'
import { cn } from '../cn'

export function Divider({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      className={cn('h-px shrink-0 self-stretch bg-line', className)}
      {...props}
    />
  )
}
