import {
  NumberInput,
  NumberInputControl,
  NumberInputGroup,
  NumberInputScrubArea,
  NumberInputScrubAreaCursor,
} from '@ui-sdk/react/number-input'
import { Check, MoveHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../cn'
import { ChevronDownIcon } from '../icons'
import { controlStates } from './inputs'
import { Menu } from './overlays'

export interface NumberPreset {
  value: number
  label: string
}

/**
 * Design-tool number field: drag the icon sideways to scrub, type, or step with the arrow keys
 * (Shift for ten steps). With `presets`, a menu at the end picks a named value. With
 * `onClear`, the field may be emptied, and shows `placeholder` (e.g. "Auto") while empty.
 */
export function NumberField({
  label,
  value,
  onChange,
  onClear,
  placeholder,
  icon,
  min,
  max,
  step = 1,
  format,
  presets,
}: {
  /** Accessible name of the input. */
  label: string
  value: number | null
  onChange: (value: number) => void
  onClear?: () => void
  placeholder?: string
  /** The scrub handle; a 16px glyph that hints at what the number sizes. Without one, no scrub. */
  icon?: ReactNode
  min?: number
  max?: number
  step?: number
  /** How the value shows, e.g. `{ style: 'percent' }` for a fraction. Typing accepts the same. */
  format?: Intl.NumberFormatOptions
  presets?: readonly NumberPreset[]
}) {
  return (
    <NumberInput
      value={value}
      min={min}
      max={max}
      step={step}
      format={format}
      onValueChange={(next) => next !== null && onChange(next)}
      onValueCommit={(next) => next === null && onClear?.()}
      className={cn(
        'flex h-10 w-full min-w-0 flex-row items-center gap-0 rounded-xl bg-control text-small text-fg',
        controlStates,
        'has-data-popup-open:inset-ring-accent',
      )}
    >
      <NumberInputGroup className="flex h-full min-w-0 flex-1 items-center">
        {icon && (
          <NumberInputScrubArea
            pixelsPerStep={2}
            className="flex h-full w-9 shrink-0 cursor-ew-resize items-center justify-center pl-1 text-fg/63 hover:text-fg data-scrubbing:text-fg [&_svg]:size-4"
          >
            <span aria-hidden className="flex">
              {icon}
            </span>
            <NumberInputScrubAreaCursor className="pointer-events-none fixed top-0 left-0 z-50 -mt-2 -ml-2 text-fg drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
              <MoveHorizontal aria-hidden className="size-4" />
            </NumberInputScrubAreaCursor>
          </NumberInputScrubArea>
        )}
        <NumberInputControl
          aria-label={label}
          placeholder={placeholder}
          className={cn(
            'm-0 h-full w-full min-w-0 flex-1 border-0 bg-transparent py-0 pr-2 text-left text-small text-fg tabular-nums outline-none placeholder:text-fg',
            icon ? 'pl-1' : 'pl-3',
          )}
        />
      </NumberInputGroup>
      {presets && (
        <Menu.Root>
          <Menu.Trigger
            aria-label={`${label} presets`}
            className="flex h-full w-9 shrink-0 items-center justify-center border-l border-black/30 text-fg/63 outline-none hover:text-fg focus-visible:text-fg data-popup-open:text-fg"
          >
            <ChevronDownIcon />
          </Menu.Trigger>
          <Menu.Popup align="end" className="min-w-40">
            {presets.map((p) => (
              <Menu.Item
                key={p.value}
                icon={p.value === value ? <Check className="size-3.5" /> : <span />}
                onClick={() => onChange(p.value)}
              >
                <span className="flex-1">{p.label}</span>
                <span className="text-fg/32 tabular-nums">
                  {new Intl.NumberFormat(undefined, format).format(p.value)}
                </span>
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Root>
      )}
    </NumberInput>
  )
}
