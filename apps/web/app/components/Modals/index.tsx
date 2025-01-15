import { useCallback } from 'react'
import { useNavigate, useSearchParams } from '@remix-run/react'
import Modal from '@valley/ui/Modal'
import CreateProjectModal from './CreateProject'
import EditFolderTitleModal from './EditFolderTitle'
import EditFolderDescriptionModal from './EditFolderDescription'
import ConfirmFolderDeletionModal from './ConfirmFolderDeletion'
import ConfirmFileDeletionModal from './ConfirmFileDeletion'
import ConfirmFolderClearModal from './ConfirmFolderClear'
import ProjectFoldersModal from './ProjectFoldersModal'

export type ModalId =
  | 'create-project'
  | 'edit-folder-title'
  | 'edit-folder-description'
  | 'confirm-folder-deletion'
  | 'confirm-file-deletion'
  | 'confirm-folder-clear'
  | 'project-folders'

export const Modals = () => {
  const navigate = useNavigate()
  const [_, setSearchParams] = useSearchParams()

  const handleClose = useCallback(() => {
    if (window.history.length === 1) {
      setSearchParams(
        (prev) => {
          prev.forEach((_, key) => {
            if (key.startsWith('modal')) prev.delete(key)
          })
          return prev
        },
        {
          replace: true,
          viewTransition: false,
        }
      )
    }

    navigate(-1)
  }, [navigate, setSearchParams])

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
      <Modal onDismiss={handleClose} id="project-folders">
        <ProjectFoldersModal onClose={handleClose} />
      </Modal>
    </>
  )
}
