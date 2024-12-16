import React from 'react'
import styles from './Divider.module.css'
import cx from 'classnames'

type DividerProps = React.PropsWithChildren<{
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'dimmed'
}> &
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'default',
  className,
  children,
  ...props
}) => {
  if (children) {
    return (
      <div
        {...props}
        className={cx(
          'Divider',
          styles.divider,
          styles['divider--withText'],
          className
        )}
      >
        <span className={cx(styles.divider, styles['divider--horizontal'])} />
        {children}
        <span className={cx(styles.divider, styles['divider--horizontal'])} />
      </div>
    )
  }

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
