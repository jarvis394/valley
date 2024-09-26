'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Modal from '@valley/ui/Modal'
import CreateProjectModal from './CreateProject'
import EditFolderTitleModal from './EditFolderTitle'
import EditFolderDescriptionModal from './EditFolderDescription'
import ConfirmFolderDeletionModal from './ConfirmFolderDeletion'

export const Modals = () => {
  const query = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const handleClose = () => {
    const newQuery = new URLSearchParams(query.toString())
    for (const key of query.keys()) {
      if (key.startsWith('modal')) {
        newQuery.delete(key)
      }
    }

    router.push(pathname + '?' + newQuery.toString())
  }

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
    </>
  )
}
