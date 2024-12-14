import { useCallback } from 'react'
import { useSearchParams } from '@remix-run/react'
import Modal from '@valley/ui/Modal'
import CreateProjectModal from './CreateProject'
import EditFolderTitleModal from './EditFolderTitle'
import EditFolderDescriptionModal from './EditFolderDescription'
import ConfirmFolderDeletionModal from './ConfirmFolderDeletion'
import ConfirmFileDeletionModal from './ConfirmFileDeletion'

export const Modals = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const handleClose = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams)
    for (const key of searchParams.keys()) {
      if (key.startsWith('modal')) {
        newSearchParams.delete(key)
      }
    }

    setSearchParams(newSearchParams)
  }, [searchParams, setSearchParams])

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
      <Modal onDismiss={handleClose} id="confirm-file-deletion">
        <ConfirmFileDeletionModal onClose={handleClose} />
      </Modal>
    </>
  )
}
