import React from 'react'
import styles from './Spinner.module.css'

const Spinner = () => {
  return (
    <div className={styles.spinner}>
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
