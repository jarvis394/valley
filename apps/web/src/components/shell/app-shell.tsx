import type { ReactNode } from 'react'

/**
 * Static frame of every signed-in page. The rail (collapsed sidebar) leaves room for the
 * editor panels, so it appears one breakpoint later than the full sidebar.
 */
export function AppShell({
  sidebar,
  collapsed,
  children,
}: {
  sidebar: ReactNode
  collapsed: boolean
  children: ReactNode
}) {
  return (
    <div className="isolate flex h-dvh overflow-hidden bg-canvas text-fg">
      <div className={collapsed ? 'hidden xl:contents' : 'hidden lg:contents'}>{sidebar}</div>
      <div className="flex min-w-0 flex-1">{children}</div>
    </div>
  )
}
