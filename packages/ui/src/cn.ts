import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge about our theme colors so `bg-control` and `bg-surface` dedupe correctly.
const twMerge = extendTailwindMerge({
  extend: { theme: { color: ['canvas', 'surface', 'control', 'control-hover', 'accent'] } },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
