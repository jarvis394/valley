import React from 'react'
import styles from './ButtonBase.module.css'
import cx from 'classnames'
import {
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
} from '../types/PolymorphicComponent'

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
}>

export type ButtonBaseProps<C extends React.ElementType = 'button'> =
  PolymorphicComponentPropWithRef<C, ButtonBaseOwnProps>

type ButtonBaseComponent = <C extends React.ElementType = 'button'>(
  props: ButtonBaseProps<C>
) => React.ReactElement | null

const ButtonBase = React.forwardRef<HTMLButtonElement>(function ButtonBase<
  C extends React.ElementType = 'button',
>(
  { variant, children, className, as, ...props }: ButtonBaseProps<C>,
  ref: PolymorphicRef<C>
) {
  const Root = as || 'button'

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

export default React.memo(ButtonBase) as ButtonBaseComponent
