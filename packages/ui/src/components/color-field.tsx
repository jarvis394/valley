import { Input } from '@base-ui/react/input'
import { useState, type ReactNode } from 'react'
import { cn } from '../cn'
import { controlClass } from './control'

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/** `#rrggbb` from a typed hex (with or without `#`, 3 or 6 digits), or null when it isn't one. */
const parseHex = (input: string) => {
  const digits = HEX.exec(input.trim())?.[1]
  if (!digits) return null

  const full = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits

  return `#${full.toLowerCase()}`
}

/** A swatch that opens the system color picker, beside the color's hex code. */
export function ColorField({
  value,
  onChange,
  label,
  end,
}: {
  /** `#rrggbb`. */
  value: string
  onChange: (value: string) => void
  label: string
  /** Trailing controls (icon buttons). */
  end?: ReactNode
}) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    const next = draft === null ? null : parseHex(draft)
    if (next && next !== value) onChange(next)
    setDraft(null)
  }

  return (
    <div className={cn(controlClass, 'pl-1', end && 'pr-1')}>
      <span className="relative flex size-8 shrink-0 items-center justify-center">
        <span
          className="size-5 rounded-md inset-ring inset-ring-white/12"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </span>
      <Input
        aria-label={`${label} hex`}
        value={draft ?? value.slice(1).toUpperCase()}
        onValueChange={setDraft}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
          if (event.key === 'Escape') setDraft(null)
        }}
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 pl-1 uppercase outline-none"
      />
      {end}
    </div>
  )
}
