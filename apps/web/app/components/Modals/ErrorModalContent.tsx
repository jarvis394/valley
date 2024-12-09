import Button from '@valley/ui/Button'
import ModalFooter from '@valley/ui/ModalFooter'
import ModalHeader from '@valley/ui/ModalHeader'
import Note from '@valley/ui/Note'
import Stack from '@valley/ui/Stack'
import React from 'react'
import styles from './Modals.module.css'

type ErrorModalContentProps = React.PropsWithChildren<{
  onClose: () => void
  title?: React.ReactNode
}>

const ErrorModalContent: React.FC<ErrorModalContentProps> = ({
  children,
  title = 'Error',
  onClose,
}) => {
  return (
    <>
      <ModalHeader>{title}</ModalHeader>
      <Stack
        gap={4}
        padding={6}
        direction="column"
        className={styles.modal__content}
      >
        <Note variant="alert" fill>
          {children}
        </Note>
      </Stack>
      <ModalFooter
        after={
          <Button onClick={onClose} variant="primary" size="md">
            Continue
          </Button>
        }
      />
    </>
  )
}

export default ErrorModalContent
