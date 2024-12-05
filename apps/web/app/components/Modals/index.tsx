import Modal from '@valley/ui/Modal'
import CreateProjectModal from './CreateProject'
import { useSearchParams } from '@remix-run/react'
import EditFolderTitleModal from './EditFolderTitle'
import { useCallback } from 'react'
import EditFolderDescriptionModal from './EditFolderDescription'

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
      <Modal
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onDismiss={handleClose}
        id="create-project"
      >
        <CreateProjectModal onClose={handleClose} />
      </Modal>
      <Modal
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onDismiss={handleClose}
        id="edit-folder-title"
      >
        <EditFolderTitleModal onClose={handleClose} />
      </Modal>
      <Modal
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        onDismiss={handleClose}
        id="edit-folder-description"
      >
        <EditFolderDescriptionModal onClose={handleClose} />
      </Modal>
    </>
  )
}
