import React from 'react'
import cx from 'classnames'
import styles from './InputLabel.module.css'

type InputLabelProps = React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
>

const InputLabel: React.FC<InputLabelProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <label {...props} className={cx(className, styles.inputLabel)}>
      {children}
    </label>
  )
}

export default InputLabel
