import { data } from '@remix-run/node'
import { ShouldRevalidateFunction } from '@remix-run/react'

export const loader = () => {
  return data(
    {
      name: 'Valley',
      short_name: 'Valley',
      start_url: '/',
      display: 'standalone',
      description: 'Platform for your photography sessions',
      background_color: '#0a0a0a',
      theme_color: '#0a0a0a',
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
      screenshots: [
        {
          src: '/screenshot-desktop-1.webp',
          sizes: '1920x1080',
          type: 'image/webp',
          form_factor: 'wide',
        },
        {
          src: '/screenshot-desktop-2.webp',
          sizes: '1920x1080',
          type: 'image/webp',
          form_factor: 'wide',
        },
        {
          src: '/screenshot-mobile-1.webp',
          sizes: '1080x1920',
          type: 'image/webp',
        },
        {
          src: '/screenshot-mobile-2.webp',
          sizes: '1080x1920',
          type: 'image/webp',
        },
      ],
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'Content-Type': 'application/manifest+json',
      },
    }
  )
}

export const shouldRevalidate: ShouldRevalidateFunction = () => false
