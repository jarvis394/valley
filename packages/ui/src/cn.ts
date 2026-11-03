import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge our theme tokens so `bg-control` dedupes and `text-small` reads as a size,
// not a color that would knock out `text-fg`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: ['canvas', 'surface', 'control', 'control-hover', 'accent'],
      text: ['micro', 'caption', 'label', 'small', 'body', 'title', 'heading', 'display'],
    },
  },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
