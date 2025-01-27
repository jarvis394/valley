import React from 'react'
import styles from './ModalContent.module.css'
import Stack, { StackProps } from '../Stack/Stack'

export type ModalContentProps = StackProps

const ModalContent: React.FC<ModalContentProps> = (props) => {
  return (
    <Stack
      direction={'column'}
      gap={4}
      padding={6}
      className={styles.modalContent}
      {...props}
    />
  )
}

export default ModalContent
