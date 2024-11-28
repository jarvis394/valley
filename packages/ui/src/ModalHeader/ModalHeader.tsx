import React from 'react'
import styles from './ModalHeader.module.css'
import * as Modal from '../Modal/Modal'

const ModalHeader: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Modal.Title asChild className={styles.modalHeader}>
      <h2>{children}</h2>
    </Modal.Title>
  )
}

export default ModalHeader
