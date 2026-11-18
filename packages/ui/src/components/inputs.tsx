import { Input } from '@base-ui/react/input'
import { Select } from '@base-ui/react/select'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { Check } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../cn'
import { ChevronDownIcon } from '../icons'
import type { Option } from './segmented'

/** Inset rings, so a field's edge never shifts layout or spills past a clipping parent. */
export const controlStates =
  'inset-ring inset-ring-transparent hover:not-focus-within:inset-ring-white/7 focus-within:inset-ring-accent'

const controlClass = cn(
  'flex min-h-10 w-full min-w-0 items-center rounded-xl bg-control text-small text-fg',
  controlStates,
)

const inputClass = 'min-w-0 flex-1 px-3 py-2.5 outline-none placeholder:text-fg/32'

/** A control that opens something on press (select, picker). */
const triggerClass = cn(
  controlClass,
  'p-1 text-left outline-none data-popup-open:inset-ring-accent',
)

/** 32px slot for a 16px icon inside a control. */
const Adornment = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('flex size-8 shrink-0 items-center justify-center opacity-63', className)}>
    {children}
  </span>
)

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

export function SelectField<T extends string>({
  value,
  options,
  onChange,
  renderItem,
  icon,
}: {
  value: T
  options: readonly Option<T>[]
  onChange: (value: T) => void
  renderItem?: (option: Option<T>) => ReactNode
  icon?: ReactNode
}) {
  return (
    <Select.Root
      items={options.map((o) => ({ value: o.value, label: o.label }))}
      value={value}
      onValueChange={(next) => next && onChange(next)}
    >
      <Select.Trigger className={triggerClass}>
        {icon && <Adornment className="-mr-2">{icon}</Adornment>}
        <Select.Value className="min-w-0 flex-1 truncate px-2" />
        <Select.Icon className="flex size-8 shrink-0 items-center justify-center opacity-63">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50 outline-none" sideOffset={4}>
          <Select.Popup className="popup-surface min-w-(--anchor-width) rounded-xl p-1 text-small">
            <Select.List className="max-h-(--available-height) overflow-y-auto">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-lg py-2 pr-4 pl-2 outline-none select-none data-highlighted:bg-white/7"
                >
                  <Select.ItemIndicator>
                    <Check className="size-3.5" />
                  </Select.ItemIndicator>
                  <Select.ItemText className="col-start-2">
                    {renderItem ? renderItem(option) : option.label}
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}

/** Shows a value in a field; pressing it opens a picker the caller owns (e.g. a native date input). */
export function FieldButton({
  icon,
  children,
  ...props
}: Omit<ComponentProps<'button'>, 'className'> & { icon?: ReactNode }) {
  return (
    <button type="button" className={triggerClass} {...props}>
      {icon && <Adornment className="-mr-2">{icon}</Adornment>}
      <span className="min-w-0 flex-1 truncate px-2">{children}</span>
    </button>
  )
}

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

export function Switch({
  checked,
  onChange,
  'aria-label': ariaLabel,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  'aria-label'?: string
}) {
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={onChange}
      aria-label={ariaLabel}
      className="flex h-6 w-10 shrink-0 items-center rounded-full border border-white/12 bg-[#212122] px-1 outline-none focus-visible:ring-2 focus-visible:ring-accent/60 data-checked:border-transparent data-checked:bg-accent"
    >
      <BaseSwitch.Thumb className="-ml-px size-4 rounded-full bg-fg shadow-[0_0_0_1px_rgba(0,0,0,0.5)] data-checked:translate-x-4 data-checked:bg-[#0f1c2e] data-checked:shadow-none" />
    </BaseSwitch.Root>
  )
}

/** A switch row styled as a control ("Use password"). */
export function SwitchField({
  label,
  checked,
  onChange,
  className,
}: {
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}) {
  return (
    <label
      className={cn(
        'flex min-h-10 items-center justify-between gap-3 rounded-xl bg-control py-2 pr-2 pl-3 text-small text-fg',
        className,
      )}
    >
      {label}
      <Switch checked={checked} onChange={onChange} />
    </label>
  )
}

function FieldGroupRoot({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-control has-[>[data-separator]]:pb-0.5">
      {children}
    </div>
  )
}

/** The spacing it adds keeps the focus ring of the control below clear of the group's clip. */
function FieldGroupSeparator() {
  return <div data-separator className="mx-0.5 mb-0.5 border-t border-dashed border-white/7" />
}

/** Controls on one surface, e.g. a switch and the field it enables ("Use password"). */
export const FieldGroup = { Root: FieldGroupRoot, Separator: FieldGroupSeparator }
