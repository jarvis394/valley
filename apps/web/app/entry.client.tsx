import { RemixBrowser } from '@remix-run/react'
import { startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'

// https://remix.run/file-conventions/entry.client
// Hydrate Remix app on a client manually
startTransition(() => {
  hydrateRoot(document, <RemixBrowser />)
})
