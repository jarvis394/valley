import Modal from '@valley/ui/Modal'
import CreateProjectModal from './CreateProject'
import { useSearchParams } from '@remix-run/react'

export const Modals = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const handleClose = () => {
    for (const key of searchParams.keys()) {
      if (key.startsWith('modal')) {
        searchParams.delete(key)
      }
    }

    setSearchParams(searchParams)
  }

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
    </>
  )
}
