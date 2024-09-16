import React from 'react'
import styles from './Divider.module.css'
import cx from 'classnames'

type DividerProps = React.PropsWithChildren<{
  orientation?: 'horizontal' | 'vertical'
}> &
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className,
  ...props
}) => {
  return (
    <span
      {...props}
      className={cx(styles.divider, className, {
        [styles['divider--horizontal']]: orientation === 'horizontal',
        [styles['divider--vertical']]: orientation === 'vertical',
      })}
    />
  )
}

export default Divider
