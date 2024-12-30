import React from 'react'
import styles from './FormControl.module.css'
import { Slot } from '@radix-ui/react-slot'
import { AsChildProps } from '../types/AsChildProps'
import FormControlContext, { FormControlState } from './FormControlContext'
import cx from 'classnames'

export type FormControlOwnProps = React.PropsWithChildren<{
  className?: string
  state?: FormControlState['state']
}>
export type FormControlProps = AsChildProps<
  React.HTMLAttributes<HTMLDivElement>
> &
  FormControlOwnProps

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  function FormControl({ asChild, state, children, className, ...props }, ref) {
    const Root = asChild ? Slot : 'div'
    const childContext: FormControlState = {
      state: state || 'default',
    }

    return (
      <FormControlContext.Provider value={childContext}>
        <Root
          className={cx(styles.formControl, className)}
          ref={ref}
          {...props}
        >
          {children}
        </Root>
      </FormControlContext.Provider>
    )
  }
)

export default FormControl
