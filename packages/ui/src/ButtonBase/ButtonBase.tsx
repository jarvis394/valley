import React from 'react'
import styles from './ButtonBase.module.css'
import cx from 'classnames'
import {
  OverridableComponent,
  OverrideProps,
} from '../types/OverridableComponent'

type ButtonBaseProps = React.PropsWithChildren<{
  variant?:
    | 'primary'
    | 'secondary'
    | 'secondary-dimmed'
    | 'tertiary'
    | 'warning'
    | 'danger'
  disabled?: boolean
}>

type ButtonBaseTypeMap<D extends React.ElementType = 'button'> = {
  props: ButtonBaseProps
  defaultComponent: D
}

export type ButtonBaseComponentProps = OverrideProps<
  ButtonBaseTypeMap,
  'button'
> & {
  component?: React.ElementType
}

const ButtonBase = React.forwardRef(
  (
    {
      variant,
      children,
      className,
      component = 'button',
      ...props
    }: ButtonBaseComponentProps,
    ref
  ) => {
    return React.createElement(
      component,
      {
        ...props,
        ref,
        className: cx(className, styles.buttonBase, {
          [styles['buttonBase--primary']]: variant === 'primary',
          [styles['buttonBase--secondary']]: variant === 'secondary',
          [styles['buttonBase--secondary-dimmed']]:
            variant === 'secondary-dimmed',
          [styles['buttonBase--tertiary']]: variant === 'tertiary',
          [styles['buttonBase--warning']]: variant === 'warning',
          [styles['buttonBase--danger']]: variant === 'danger',
        }),
      },
      children
    )
  }
) as OverridableComponent<ButtonBaseTypeMap>

export default ButtonBase
