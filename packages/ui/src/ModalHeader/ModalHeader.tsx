import React from 'react'
import styles from './ModalHeader.module.css'
import { DialogTitleProps } from '../Modal/Modal'

const ModalHeader: React.FC<DialogTitleProps> = ({ children, ...props }) => {
  return (
    <h2 {...props} className={styles.modalHeader}>
      {children}
    </h2>
  )
}

export default ModalHeader
