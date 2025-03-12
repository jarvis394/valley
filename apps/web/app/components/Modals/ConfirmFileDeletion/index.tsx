import React, { useState } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import ModalContent from '@valley/ui/ModalContent'
import { useRemixForm } from 'remix-hook-form'
import Note from '@valley/ui/Note'
import { Form, useParams } from '@remix-run/react'
import { useIsPending } from 'app/utils/misc'
import { FolderWithFiles } from '@valley/shared'
import { redirectToKey } from 'app/config/paramsKeys'
import ErrorModalContent from '../ErrorModalContent'
import { useFolder } from 'app/utils/folder'

type ConfirmFileDeletionProps = { onClose: () => void }

const ModalContents: React.FC<
  { folder?: FolderWithFiles | null } & ConfirmFileDeletionProps
> = ({ folder, onClose }) => {
  const searchParams = new URLSearchParams(window.location.search)
  const { folderId, projectId } = useParams()
  const [fileId] = useState(searchParams.get('modal-fileId'))
  const file = folder?.files.find((e) => e.id === fileId)
  const redirectTo = `/projects/${projectId}/folder/${folderId}`
  const formAction = `/api/files/${file?.id}/delete?${redirectToKey}=${redirectTo}`
  const { handleSubmit } = useRemixForm<FormData>({
    submitConfig: {
      navigate: true,
      action: formAction,
      method: 'POST',
      preventScrollReset: true,
    },
  })
  const isPending = useIsPending({ formAction })

  if (!file) {
    return (
      <ErrorModalContent onClose={onClose} title={'Delete File'}>
        File &quot;{fileId}&quot; was not found.
      </ErrorModalContent>
    )
  }

  return (
    <>
      <ModalHeader>Delete File</ModalHeader>
      <ModalContent asChild>
        <Form
          onSubmit={handleSubmit}
          id="confirm-folder-deletion-form"
          method="POST"
          action={formAction}
        >
          <p>
            File <b>&quot;{file.name}&quot;</b> will be deleted.
          </p>
          <Note variant="warning" fill>
            You can restore this file from trash later
          </Note>
        </Form>
      </ModalContent>
      <ModalFooter
        before={
          <Button
            tabIndex={0}
            onClick={onClose}
            variant="secondary-dimmed"
            size="md"
            disabled={isPending}
          >
            Cancel
          </Button>
        }
        after={
          <Button
            form="confirm-folder-deletion-form"
            variant="primary"
            size="md"
            type="submit"
            disabled={isPending}
            loading={isPending}
          >
            Delete
          </Button>
        }
      />
    </>
  )
}

const ConfirmFileDeletionModal: React.FC<ConfirmFileDeletionProps> = ({
  onClose,
}) => {
  const folder = useFolder()

  return <ModalContents onClose={onClose} folder={folder} />
}

export default ConfirmFileDeletionModal
