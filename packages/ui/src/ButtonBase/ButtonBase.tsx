import React from 'react'
import styles from './ButtonBase.module.css'
import cx from 'classnames'
import { OverridableComponent, OverrideProps } from '@mui/types'

export type ButtonBaseOwnProps = React.PropsWithChildren<{
  variant?:
    | 'primary'
    | 'secondary'
    | 'secondary-dimmed'
    | 'tertiary'
    | 'tertiary-dimmed'
    | 'warning'
    | 'danger'
  disabled?: boolean
  ref?: React.Ref<unknown>
}>

export type ButtonBaseTypeMap<
  AdditionalProps = unknown,
  RootComponent extends React.ElementType = 'button'
> = {
  props: AdditionalProps & ButtonBaseOwnProps
  defaultComponent: RootComponent
}

export type ButtonBaseProps<
  RootComponent extends React.ElementType = ButtonBaseTypeMap['defaultComponent'],
  AdditionalProps = unknown
> = OverrideProps<
  ButtonBaseTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType
}

const ButtonBase = React.forwardRef<HTMLButtonElement>(function ButtonBase(
  { variant, children, className, component, ...props }: ButtonBaseProps,
  ref
) {
  const Root = component || 'button'

  return (
    <Root
      {...props}
      className={cx(className, styles.buttonBase, {
        [styles['buttonBase--primary']]: variant === 'primary',
        [styles['buttonBase--secondary']]: variant === 'secondary',
        [styles['buttonBase--secondary-dimmed']]:
          variant === 'secondary-dimmed',
        [styles['buttonBase--tertiary']]: variant === 'tertiary',
        [styles['buttonBase--tertiary-dimmed']]: variant === 'tertiary-dimmed',
        [styles['buttonBase--warning']]: variant === 'warning',
        [styles['buttonBase--danger']]: variant === 'danger',
      })}
      ref={ref}
    >
      {children}
    </Root>
  )
})

export default React.memo(ButtonBase) as OverridableComponent<ButtonBaseTypeMap>
