import React from 'react'
import styles from './Wrapper.module.css'
import cx from 'classnames'

type WrapperProps = React.PropsWithChildren<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>

const Wrapper: React.FC<WrapperProps> = ({ children, className }) => {
  return <div className={cx(styles.wrapper, className)}>{children}</div>
}

export default Wrapper
