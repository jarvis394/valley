import { Switch as BaseSwitch } from '@base-ui/react/switch'
import type { ReactNode } from 'react'
import { cn } from '../cn'
import { focusRing } from './styles'

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
      className={cn(
        'flex h-6 w-10 shrink-0 items-center rounded-full border border-white/12 bg-[#212122] px-1 data-checked:border-transparent data-checked:bg-accent',
        focusRing,
      )}
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
