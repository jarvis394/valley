import { HydratedRouter } from 'react-router/dom'
import { startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'

// https://remix.run/file-conventions/entry.client
// Hydrate Remix app on a client manually
startTransition(() => {
  hydrateRoot(document, <HydratedRouter />)
})
