import React from 'react'
import styles from './MenuSeparator.module.css'
import cx from 'classnames'

type MenuSeparatorProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>

const MenuSeparator: React.FC<MenuSeparatorProps> = ({
  className,
  ...props
}) => {
  return (
    <span
      role="separator"
      aria-orientation="horizontal"
      className={cx(styles.menuSeparator, className)}
      {...props}
    />
  )
}

export default MenuSeparator
