import { useCallback } from 'react'
import { useNavigate, useSearchParams } from '@remix-run/react'
import CreateProjectModal from './CreateProject'
import EditFolderTitleModal from './EditFolderTitle'
import EditFolderDescriptionModal from './EditFolderDescription'
import ConfirmFolderDeletionModal from './ConfirmFolderDeletion'
import ConfirmFileDeletionModal from './ConfirmFileDeletion'
import ConfirmFolderClearModal from './ConfirmFolderClear'

export type ModalId =
  | 'create-project'
  | 'edit-folder-title'
  | 'edit-folder-description'
  | 'confirm-folder-deletion'
  | 'confirm-file-deletion'
  | 'confirm-folder-clear'

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
      <CreateProjectModal onClose={handleClose} />
      <EditFolderTitleModal onClose={handleClose} />
      <EditFolderDescriptionModal onClose={handleClose} />
      <ConfirmFolderDeletionModal onClose={handleClose} />
      <ConfirmFolderClearModal onClose={handleClose} />
      <ConfirmFileDeletionModal onClose={handleClose} />
    </>
  )
}
