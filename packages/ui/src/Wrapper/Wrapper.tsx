import React from 'react'
import styles from './Wrapper.module.css'
import cx from 'classnames'
import Paper, { PaperOwnProps } from '../Paper/Paper'
import { createPolymorphicComponent } from '../utils/createPolymorphicComponent'

export type WrapperOwnProps = PaperOwnProps

const Wrapper: React.FC<
  WrapperOwnProps & {
    className?: string
  }
> = ({ children, className, variant = 'tertiary', ...props }) => {
  return (
    <Paper
      {...props}
      variant={variant}
      className={cx(styles.wrapper, className)}
    >
      {children}
    </Paper>
  )
}

export default createPolymorphicComponent<'div', PaperOwnProps>(Wrapper)
