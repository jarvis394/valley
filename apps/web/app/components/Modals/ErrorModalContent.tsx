import Button from '@valley/ui/Button'
import ModalFooter from '@valley/ui/ModalFooter'
import ModalHeader from '@valley/ui/ModalHeader'
import Note from '@valley/ui/Note'
import React from 'react'
import ModalContent from '@valley/ui/ModalContent'

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
      <ModalContent>
        <Note variant="alert" fill>
          {children}
        </Note>
      </ModalContent>
      <ModalFooter
        before={<></>}
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
