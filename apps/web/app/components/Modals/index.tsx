import { useCallback } from 'react'
import { useNavigate } from '@remix-run/react'
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
      <CreateProjectModal onClose={handleClose} />
      <EditFolderTitleModal onClose={handleClose} />
      <EditFolderDescriptionModal onClose={handleClose} />
      <ConfirmFolderDeletionModal onClose={handleClose} />
      <ConfirmFolderClearModal onClose={handleClose} />
      <ConfirmFileDeletionModal onClose={handleClose} />
    </>
  )
}
