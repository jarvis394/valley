import React from 'react'
import styles from './Divider.module.css'
import cx from 'classnames'

type DividerProps = React.PropsWithChildren<{
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'dimmed'
}> &
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'default',
  className,
  ...props
}) => {
  return (
    <span
      {...props}
      className={cx(styles.divider, className, {
        [styles['divider--dimmed']]: variant === 'dimmed',
        [styles['divider--horizontal']]: orientation === 'horizontal',
        [styles['divider--vertical']]: orientation === 'vertical',
      })}
    />
  )
}

export default Divider
