import { Input } from '@base-ui/react/input'
import { useState, type ComponentProps } from 'react'
import { cn } from '../cn'
import { EyeIcon, EyeOffIcon } from '../icons'
import { IconButton } from './button'
import { controlRing } from './control'
import type { WithClassName } from './styles'

const SIZES = {
  md: 'h-10',
  lg: 'h-11',
} as const

type TextInputProps = WithClassName<Omit<ComponentProps<typeof Input>, 'size'>> & {
  size?: keyof typeof SIZES
  /** For an input outside a `Field`; inside one, the field's `error` marks it. */
  invalid?: boolean
}

/** Native text input for forms; takes `name`, `required` and the rest as is. */
export function TextInput({ size = 'md', invalid, className, ...props }: TextInputProps) {
  return (
    <Input
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full min-w-0 rounded-xl bg-control px-3 text-body text-fg outline-none placeholder:text-fg/32 disabled:pointer-events-none disabled:opacity-40',
        controlRing.outlined,
        SIZES[size],
        className,
      )}
      {...props}
    />
  )
}

export function PasswordInput({ className, ...props }: Omit<TextInputProps, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <TextInput {...props} type={visible ? 'text' : 'password'} className="pr-11" />
      <IconButton
        size="sm"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute top-1/2 right-1.5 -translate-y-1/2"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </IconButton>
    </div>
  )
}
