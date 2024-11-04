import React from 'react'
import styles from './FormHelperText.module.css'
import { useFormControl, FormControlState } from '../FormControl'
import cx from 'classnames'
import InfoCircleFill from '../svg/InfoCircleFill'
import CheckCircleFill from '../svg/CheckCircleFill'

export type FormHelperTextProps = React.PropsWithChildren<{
  state?: FormControlState['state']
}> &
  React.HTMLAttributes<HTMLParagraphElement>

const FormHelperText: React.FC<FormHelperTextProps> = ({
  state: propsState,
  className,
  children,
  ...props
}) => {
  const formControl = useFormControl()
  const state = propsState || formControl?.state

  return (
    <p
      className={cx(styles.formHelperText, className, {
        [styles['formHelperText--error']]: state === 'error',
        [styles['formHelperText--valid']]: state === 'valid',
      })}
      {...props}
    >
      {state === 'error' && <InfoCircleFill color="var(--red-700)" />}
      {state === 'valid' && <CheckCircleFill color="var(--green-700)" />}
      {children}
    </p>
  )
}

export default FormHelperText
