import React from 'react'
import styles from './ModalHeader.module.css'

const ModalHeader: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className={styles.modalHeader}>
      <h2>{children}</h2>
    </div>
  )
}

export default ModalHeader
