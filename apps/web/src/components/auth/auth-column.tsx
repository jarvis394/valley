import { Link } from '@tanstack/react-router'
import { Button, GithubIcon, LogoIcon } from '@valley/ui'
import type { ReactNode } from 'react'
import { REPOSITORY_URL } from '../../config/constants'

export function AuthColumn({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-between p-4">
      <header className="flex h-12 w-full items-center justify-between px-2">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-black text-fg">
            <LogoIcon />
          </span>
          <span className="text-title font-medium tracking-tight text-fg">Valley</span>
        </Link>
        <Button
          variant="outline"
          size="sm"
          icon={<GithubIcon />}
          render={<a href={REPOSITORY_URL} target="_blank" rel="noreferrer" />}
        >
          Leave a star
        </Button>
      </header>
      <main className="grid w-full max-w-100 flex-1 content-center justify-items-center gap-6 py-8">
        {children}
      </main>
      <div className="flex min-h-10 w-full items-center justify-center">{footer}</div>
    </div>
  )
}
