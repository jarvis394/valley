import React from 'react'
import styles from './Spinner.module.css'
import cx from 'classnames'

const Spinner: React.FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ className, ...props }) => {
  return (
    <div {...props} className={cx(styles.spinner, className)}>
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
    </div>
  )
}

export default Spinner
