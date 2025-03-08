import React from 'react'
import cx from 'classnames'
import styles from './Label.module.css'

type LabelProps = React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
> & {
  required?: boolean
  size?: 'md' | 'lg'
  standalone?: boolean
  fullHeight?: boolean
  fullWidth?: boolean
}

const Label: React.FC<LabelProps> = ({
  children,
  className,
  required,
  size = 'md',
  standalone,
  fullHeight,
  fullWidth,
  ...props
}) => {
  return (
    <label
      {...props}
      className={cx(className, styles.label, {
        [styles['label--size-md']]: size === 'md',
        [styles['label--size-lg']]: size === 'lg',
        [styles['label--standalone']]: standalone,
        [styles['label--fullHeight']]: fullHeight,
        [styles['label--fullWidth']]: fullWidth,
      })}
    >
      {children}
      {required && <span className={styles.label__requiredStar}>*</span>}
    </label>
  )
}

export default Label
