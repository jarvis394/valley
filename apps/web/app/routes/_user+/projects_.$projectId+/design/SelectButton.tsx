import { cn } from '@valley/shared'
import ButtonBase from '@valley/ui/ButtonBase'
import { CheckCircleFill } from 'geist-ui-icons'
import React from 'react'

const SelectButton: React.FC<
  {
    label?: string
    selected?: boolean
    containerProps?: React.HTMLAttributes<HTMLDivElement>
    id?: string
  } & React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = ({
  label,
  containerProps,
  children,
  selected,
  className,
  id,
  ...props
}) => {
  return (
    <div className="flex w-full flex-col items-center" {...containerProps}>
      <ButtonBase
        className={cn(
          'relative min-w-full flex-col gap-2 rounded-lg p-4 active:scale-98',
          className
        )}
        id={id}
        variant={selected ? 'secondary' : 'secondary-dimmed'}
        {...props}
      >
        {children}
        {selected && (
          <CheckCircleFill className="text-ds-blue-900 absolute -right-0.5 -bottom-0.5 z-10" />
        )}
        <div className="border-alpha-transparent-12 bg-alpha-solid-03 absolute -right-0.5 -bottom-0.5 size-4 rounded-full border-1" />
      </ButtonBase>
      {label && (
        <label
          htmlFor={id}
          className={
            'w-full cursor-pointer pt-2 text-center text-sm select-none'
          }
        >
          {label}
        </label>
      )}
    </div>
  )
}

export default React.memo(SelectButton)
