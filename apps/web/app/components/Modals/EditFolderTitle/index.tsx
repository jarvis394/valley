import React, { Suspense } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from '../Modals.module.css'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '@valley/ui/TextField'
import { Await, Form, useParams, useSearchParams } from '@remix-run/react'
import { FoldersEditSchema } from 'app/routes/api+/folders+/$id.edit'
import { useRemixForm } from 'remix-hook-form'
import { useIsPending } from 'app/utils/misc'
import Modal from '@valley/ui/Modal'
import { useProjectAwait } from 'app/utils/project'
import { ProjectWithFolders } from '@valley/shared'

type FormData = z.infer<typeof FoldersEditSchema>

const resolver = zodResolver(FoldersEditSchema)

type EditFolderTitleModalProps = {
  onClose: () => void
}

const ModalContent: React.FC<
  EditFolderTitleModalProps & {
    project?: ProjectWithFolders | null
  }
> = ({ onClose, project }) => {
  const { folderId: paramsFolderId } = useParams()
  const [searchParams] = useSearchParams()
  const modalPropsFolderId = searchParams.get('modal-folderId')
  const folderId = modalPropsFolderId || paramsFolderId
  const currentFolder = project?.folders.find((f) => f.id === folderId)
  const defaultTitle = currentFolder?.title
  const formAction = '/api/folders/' + folderId + '/edit'
  const { register, getFieldState, formState, handleSubmit } =
    useRemixForm<FormData>({
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
    <Modal onDismiss={onClose} id="edit-folder-title">
      <ModalHeader>Edit Folder Title</ModalHeader>
      <Form
        onSubmit={handleSubmit}
        id="edit-folder-title-form"
        className={styles.modal__content}
        action={formAction}
        method="POST"
      >
        <div>
          <TextField
            {...register('title', {
              required: true,
              value: defaultTitle,
            })}
            fieldState={getFieldState('title', formState)}
            label="Title"
            required
            size="lg"
            id="folder-title-input"
            placeholder="Folder"
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
            form="edit-folder-title-form"
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

const EditFolderTitleModal: React.FC<EditFolderTitleModalProps> = ({
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

export default EditFolderTitleModal
