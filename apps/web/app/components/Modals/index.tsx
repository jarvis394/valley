import { useCallback } from 'react'
import { useNavigate } from '@remix-run/react'
import Modal from '@valley/ui/Modal'
import CreateProjectModal from './CreateProject'
import EditFolderTitleModal from './EditFolderTitle'
import EditFolderDescriptionModal from './EditFolderDescription'
import ConfirmFolderDeletionModal from './ConfirmFolderDeletion'
import ConfirmFileDeletionModal from './ConfirmFileDeletion'
import ConfirmFolderClearModal from './ConfirmFolderClear'

export const Modals = () => {
  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return (
    <>
      <Modal onDismiss={handleClose} id="create-project">
        <CreateProjectModal onClose={handleClose} />
      </Modal>
      <Modal onDismiss={handleClose} id="edit-folder-title">
        <EditFolderTitleModal onClose={handleClose} />
      </Modal>
      <Modal onDismiss={handleClose} id="edit-folder-description">
        <EditFolderDescriptionModal onClose={handleClose} />
      </Modal>
      <Modal onDismiss={handleClose} id="confirm-folder-deletion">
        <ConfirmFolderDeletionModal onClose={handleClose} />
      </Modal>
      <Modal onDismiss={handleClose} id="confirm-folder-clear">
        <ConfirmFolderClearModal onClose={handleClose} />
      </Modal>
      <Modal onDismiss={handleClose} id="confirm-file-deletion">
        <ConfirmFileDeletionModal onClose={handleClose} />
      </Modal>
    </>
  )
}
