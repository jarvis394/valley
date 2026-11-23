import type { CSSProperties, ReactNode } from 'react'

/** The auth screens' panel: a rounder, padded take on the kit's `Card` surface. */
export function AuthCard({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  return (
    <div
      style={style}
      className="w-full rounded-[28px] border-[0.5px] border-white/7 bg-surface p-6"
    >
      {children}
    </div>
  )
}
