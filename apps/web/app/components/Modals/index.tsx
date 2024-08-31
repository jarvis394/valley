'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import CreateProjectModal from './CreateProject'
import EditFolderTitleModal from './EditFolderTitle'
import EditFolderDescriptionModal from './EditFolderDescription'
import Modal from '@valley/ui/Modal'

export const Modals = () => {
  const query = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const handleClose = () => {
    const newQuery = new URLSearchParams(query.toString())
    newQuery.delete('modal')

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
    </>
  )
}
