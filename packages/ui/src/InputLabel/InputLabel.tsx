import React from 'react'
import cx from 'classnames'
import styles from './InputLabel.module.css'

type InputLabelProps = React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
> & {
  required?: boolean
  size?: 'md' | 'lg'
}

const InputLabel: React.FC<InputLabelProps> = ({
  children,
  className,
  required,
  size = 'md',
  ...props
}) => {
  return (
    <label
      {...props}
      className={cx(className, styles.inputLabel, {
        [styles['inputLabel--size-md']]: size === 'md',
        [styles['inputLabel--size-lg']]: size === 'lg',
      })}
    >
      {children}
      {required && <span className={styles.inputLabel__requiredStar}>*</span>}
    </label>
  )
}

export default InputLabel
