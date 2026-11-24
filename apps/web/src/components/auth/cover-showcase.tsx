import { cn } from '@valley/ui'
import { useEffect, useState } from 'react'
import { TELEGRAM_PHOTOS_URL } from '../../config/constants'

const COVERS = [
  '/assets/cover-1.webp',
  '/assets/cover-2.webp',
  '/assets/cover-3.webp',
  '/assets/cover-4.webp',
  '/assets/cover-5.webp',
  '/assets/cover-6.webp',
  '/assets/cover-7.webp',
  '/assets/cover-8.webp',
] as const

const COVER_SWITCH_MS = 7000

export function AuthCoverShowcase() {
  const [active, setActive] = useState(0)

  // oxlint-disable-next-line valley/no-unreasoned-state-sync -- advances the cover slideshow interval while shown on desktop
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64rem)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: number | undefined

    const sync = () => {
      window.clearInterval(timer)
      timer = undefined
      if (desktop.matches && !reduced.matches) {
        timer = window.setInterval(() => {
          setActive((current) => (current + 1) % COVERS.length)
        }, COVER_SWITCH_MS)
      }
    }

    sync()
    desktop.addEventListener('change', sync)
    reduced.addEventListener('change', sync)

    return () => {
      window.clearInterval(timer)
      desktop.removeEventListener('change', sync)
      reduced.removeEventListener('change', sync)
    }
  }, [])

  return (
    <aside className="hidden flex-1 p-4 lg:flex">
      <div className="sticky top-4 flex h-[calc(100dvh-2rem)] w-full items-center justify-center overflow-hidden rounded-[48px] bg-white/7 [view-transition-class:auth-static] [view-transition-name:auth-showcase]">
        {COVERS.map((cover, index) => (
          <img
            key={`blur-${cover}`}
            src={cover}
            alt=""
            className={cn(
              'pointer-events-none absolute inset-0 size-full scale-110 object-cover object-center blur-3xl transition-[opacity,visibility] duration-[1200ms] ease-[cubic-bezier(1,0,0,1)] select-none',
              index === active ? 'visible opacity-100' : 'invisible opacity-0',
            )}
          />
        ))}
        {COVERS.map((cover, index) => (
          <img
            key={cover}
            src={cover}
            loading={index === 0 ? 'eager' : 'lazy'}
            alt=""
            className={cn(
              'absolute z-10 aspect-2/3 h-[calc(100%-4rem)] w-auto max-w-[calc(100%-4rem)] rounded-3xl object-cover object-center shadow-[0_0_4px_rgba(0,0,0,0.05),0_0_16px_rgba(0,0,0,0.05)] transition-[opacity,filter,scale,visibility] duration-[1200ms] ease-[cubic-bezier(1,0,0,1)] select-none',
              index === active
                ? 'visible scale-100 opacity-100 blur-none'
                : 'invisible scale-98 opacity-0 blur-sm',
            )}
          />
        ))}
        <a
          href={TELEGRAM_PHOTOS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-10 z-20 rounded-full p-4 text-body text-white opacity-63 [text-shadow:0_0_4px_rgba(0,0,0,0.4)] transition-[opacity,scale] duration-240 ease-[cubic-bezier(0.075,0.82,0.165,1)] hover:opacity-100 active:scale-98"
        >
          @tarnatovski
        </a>
      </div>
    </aside>
  )
}
