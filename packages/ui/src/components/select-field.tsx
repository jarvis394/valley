import { Select } from '@base-ui/react/select'
import { Check } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { ChevronDownIcon } from '../icons'
import { Adornment, triggerClass } from './control'
import type { Option } from './segmented'

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
        <Select.Icon className="flex size-8 shrink-0 items-center justify-center">
          <ChevronDownIcon opacity={0.63} />
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
