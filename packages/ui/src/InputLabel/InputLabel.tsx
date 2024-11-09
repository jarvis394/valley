import React from 'react'
import cx from 'classnames'
import styles from './InputLabel.module.css'

type InputLabelProps = React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
> & {
  required?: boolean
}

const InputLabel: React.FC<InputLabelProps> = ({
  children,
  className,
  required,
  ...props
}) => {
  return (
    <label {...props} className={cx(className, styles.inputLabel)}>
      {children}
      {required && <span className={styles.inputLabel__requiredStar}>*</span>}
    </label>
  )
}

export default InputLabel
