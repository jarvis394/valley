import { Input } from '@base-ui/react/input'
import type { ReactNode } from 'react'
import { cn } from '../cn'
import { Adornment, controlClass, inputClass } from './control'

/** Controlled inspector field with optional prefix, icon and trailing controls. */
export function TextField({
  value,
  onChange,
  placeholder,
  multiline,
  prefix,
  icon,
  end,
  type,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  /** Static text before the value, e.g. a URL base. */
  prefix?: string
  icon?: ReactNode
  /** Trailing controls (icon buttons). */
  end?: ReactNode
  type?: 'text' | 'password'
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className={cn(controlClass, inputClass, 'resize-y')}
      />
    )
  }

  return (
    <label className={cn(controlClass, 'overflow-hidden', end && 'pr-1')}>
      {prefix && (
        <span className="flex self-stretch bg-black/20 px-3 py-2.5 whitespace-nowrap text-fg/63">
          {prefix}
        </span>
      )}
      {icon && <Adornment className="-mr-2 ml-1">{icon}</Adornment>}
      {/* An input clips text to its content box, so it is sized to its text by a hidden mirror
          and this padded wrapper scrolls instead: text runs to the edges, with an inset at either end. */}
      <span className="flex min-w-0 flex-1 self-stretch overflow-x-auto overscroll-x-contain pl-3 [scrollbar-width:none]">
        <span className="grid w-max min-w-full shrink-0 pr-3">
          <span
            aria-hidden
            className="invisible col-start-1 row-start-1 py-2.5 pr-0.5 whitespace-pre"
          >
            {(type === 'password' ? '•'.repeat(value.length) : value) || placeholder}
          </span>
          <Input
            type={type}
            value={value}
            placeholder={placeholder}
            onValueChange={(next) => onChange(next)}
            className="col-start-1 row-start-1 w-full min-w-0 bg-transparent py-2.5 outline-none placeholder:text-fg/32"
          />
        </span>
      </span>
      {end}
    </label>
  )
}
