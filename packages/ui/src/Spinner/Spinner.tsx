import React from 'react'
import styles from './Spinner.module.css'
import cx from 'classnames'
import { AsChildProps } from '../types/AsChildProps'
import { Slot } from '@radix-ui/react-slot'

type SpinnerProps = AsChildProps<React.HTMLAttributes<HTMLDivElement>> & {
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({ className, asChild, ...props }) => {
  const Root = asChild ? Slot : 'div'

  return (
    <Root {...props} className={cx(styles.spinner, className)}>
      <div className={styles.spinner__inner}>
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
        <div className={styles.spinner__bar} />
      </div>
    </Root>
  )
}

export default React.memo(Spinner)
