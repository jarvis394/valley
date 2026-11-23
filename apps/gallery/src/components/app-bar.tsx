import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, IconButton } from '@valley/ui'

export function AppBar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-14 items-center px-3 transition-opacity duration-200 in-data-[lightbox=open]:opacity-0">
      <IconButton
        variant="overlay"
        aria-label="Back to portfolio"
        className="pointer-events-auto in-data-[lightbox=open]:pointer-events-none"
        render={<Link to="/" />}
      >
        <ArrowLeftIcon />
      </IconButton>
    </header>
  )
}
