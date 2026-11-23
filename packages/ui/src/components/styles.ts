import type { ReactElement } from 'react'

export const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-accent/60'

export const hairline = 'border-[0.5px] border-white/7'

/** Base UI types `className` as a string or a state function; the kit only takes strings. */
export type WithClassName<P> = Omit<P, 'className'> & { className?: string }

/** Native buttons default to `submit`; an element swapped in through `render` keeps its own. */
export const buttonType = (render?: ReactElement) => (render ? {} : { type: 'button' as const })
