import { createRouter } from '@tanstack/react-router'
import { NotFound } from './components/not-found'
import { routeTree } from './routeTree.gen'

/**
 * Pages link with plain anchors and never preload, so a static export works without the
 * server functions the loaders call.
 */
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: false,
    defaultNotFoundComponent: NotFound,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
