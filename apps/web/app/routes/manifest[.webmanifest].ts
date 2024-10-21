import type { WebAppManifest } from '@remix-pwa/dev'
import { json } from '@remix-run/node'

export const loader = () => {
  return json(
    {
      title: 'Valley',
      name: 'Valley',
      short_name: 'Valley',
      start_url: '/',
      display: 'standalone',
      description: 'Platform for your photography sessions',
      background_color: '#0a0a0a',
      theme_color: '#ededed',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    } as WebAppManifest,
    {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'Content-Type': 'application/manifest+json',
      },
    }
  )
}
