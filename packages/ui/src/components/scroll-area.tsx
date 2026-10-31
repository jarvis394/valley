import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import type { ComponentProps, ReactElement } from 'react'
import { cn } from '../cn'

const SCROLLBAR = {
  /** Sidebars: shown only while hovered, with a faint rule marking the track under the pointer. */
  panel: {
    track: 'border-l border-transparent hover:border-white/7 data-hovering:opacity-100',
    thumb: 'w-1.5 bg-white/24',
  },
  /** Content areas: also shown while scrolling. */
  plain: {
    track: 'data-hovering:opacity-100 data-scrolling:opacity-100 data-scrolling:duration-0',
    thumb: 'w-1.5 bg-white/24',
  },
  /** Canvas: a dark bordered pill inset from the edges, legible over photos and light blocks. */
  canvas: {
    track:
      'my-1 w-auto px-0.5 data-hovering:opacity-100 data-scrolling:opacity-100 data-scrolling:duration-0',
    thumb: 'w-1.5 border border-white/32 bg-black/32',
  },
} as const

/**
 * Vertical scroller with an overlay scrollbar that takes no room from the content. Horizontal
 * overflow is clipped and its overscroll disabled, so trackpad swipes don't bounce sideways.
 * `className` places the box in its parent; `contentClassName` lays out what scrolls.
 */
export function ScrollArea({
  scrollbar = 'panel',
  render,
  className,
  contentClassName,
  children,
  ...props
}: ComponentProps<'div'> & {
  scrollbar?: keyof typeof SCROLLBAR | 'hidden'
  render?: ReactElement
  contentClassName?: string
}) {
  return (
    <BaseScrollArea.Root
      render={render}
      className={cn('flex min-h-0 flex-col', className)}
      {...props}
    >
      <BaseScrollArea.Viewport
        className="min-h-0 flex-1 overscroll-x-none overscroll-y-contain outline-none"
        // The viewport sets `overflow: scroll` inline, which a class can't override.
        style={{ overflowX: 'clip' }}
      >
        {/* Overrides the inline `min-width: fit-content`, which widens rows past the box instead of truncating. */}
        <BaseScrollArea.Content className={cn('min-w-0!', contentClassName)}>
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      {scrollbar !== 'hidden' && (
        <BaseScrollArea.Scrollbar
          className={cn(
            'z-40 flex w-3 justify-center py-1 opacity-0 transition-[opacity,border-color] duration-150',
            SCROLLBAR[scrollbar].track,
          )}
        >
          <BaseScrollArea.Thumb className={cn('rounded-full', SCROLLBAR[scrollbar].thumb)} />
        </BaseScrollArea.Scrollbar>
      )}
    </BaseScrollArea.Root>
  )
}
