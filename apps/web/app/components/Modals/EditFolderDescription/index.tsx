import React, { Suspense } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from '../Modals.module.css'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import TextArea from '@valley/ui/TextArea'
import { Await, Form, useParams, useSearchParams } from '@remix-run/react'
import { FoldersEditSchema } from 'app/routes/api+/folders+/$id.edit'
import { useRemixForm } from 'remix-hook-form'
import { useIsPending } from 'app/utils/misc'
import Modal from '@valley/ui/Modal'
import { ProjectWithFolders } from '@valley/shared'
import { useProjectAwait } from 'app/utils/project'

type FormData = z.infer<typeof FoldersEditSchema>

const resolver = zodResolver(FoldersEditSchema)

type EditFolderDescriptionModalProps = {
  onClose: () => void
}

const ModalContent: React.FC<
  EditFolderDescriptionModalProps & {
    project?: ProjectWithFolders | null
  }
> = ({ onClose, project }) => {
  const { folderId: paramsFolderId } = useParams()
  const [searchParams] = useSearchParams()
  const modalPropsFolderId = searchParams.get('modal-folderId')
  const folderId = modalPropsFolderId || paramsFolderId
  const currentFolder = project?.folders.find((f) => f.id === folderId)
  const defaultDescription = currentFolder?.description || ''
  const formAction = '/api/folders/' + folderId + '/edit'
  const { register, handleSubmit } = useRemixForm<FormData>({
    resolver,
    submitConfig: {
      action: formAction,
      method: 'POST',
    },
  })
  const isPending = useIsPending({
    formMethod: 'POST',
    formAction,
  })

  return (
    <Modal onDismiss={onClose} id="edit-folder-description">
      <ModalHeader>Edit Folder Description</ModalHeader>
      <Form
        onSubmit={handleSubmit}
        className={styles.modal__content}
        id="edit-folder-description-form"
        method="POST"
        action={formAction}
      >
        <div>
          <TextArea
            {...register('description', {
              value: defaultDescription,
            })}
            size="lg"
            defaultValue={defaultDescription}
            id="folder-description-input"
            placeholder="Write here anything..."
          />
        </div>
      </Form>
      <ModalFooter
        before={
          <Button
            onClick={onClose}
            disabled={isPending}
            variant="secondary-dimmed"
            size="md"
          >
            Cancel
          </Button>
        }
        after={
          <Button
            form="edit-folder-description-form"
            variant="primary"
            size="md"
            type="submit"
            disabled={isPending}
            loading={isPending}
          >
            Save
          </Button>
        }
      />
    </Modal>
  )
}

const EditFolderDescriptionModal: React.FC<EditFolderDescriptionModalProps> = ({
  onClose,
}) => {
  const data = useProjectAwait()

  return (
    <Suspense>
      <Await resolve={data?.project}>
        {(resolvedProject) => (
          <ModalContent onClose={onClose} project={resolvedProject} />
        )}
      </Await>
    </Suspense>
  )
}

export default EditFolderDescriptionModal
