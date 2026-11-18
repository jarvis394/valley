import { Link } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'
import { ArrowLeftIcon, cn, IconButton } from '@valley/ui'

/** Matches the bar's `h-14`. */
const BAR_HEIGHT = 56

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true })
  window.addEventListener('resize', onChange)

  return () => {
    window.removeEventListener('scroll', onChange)
    window.removeEventListener('resize', onChange)
  }
}

/** Whether the cover block is under the bar; the viewer marks each block with `data-block`. */
function isOverCover() {
  const rect = document.querySelector('[data-block="cover"]')?.getBoundingClientRect()

  return !!rect && rect.top < BAR_HEIGHT && rect.bottom > BAR_HEIGHT
}

/** Clear over the cover so the photo shows through, blurred dark once content scrolls under it. */
export function AppBar() {
  const overCover = useSyncExternalStore(subscribe, isOverCover, () => true)

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 flex h-14 items-center px-3 transition-[background-color,backdrop-filter] duration-300',
        overCover ? 'bg-transparent' : 'bg-neutral-950/72 backdrop-blur-xl',
      )}
    >
      <IconButton variant="overlay" aria-label="Back to portfolio" render={<Link to="/" />}>
        <ArrowLeftIcon />
      </IconButton>
    </header>
  )
}
