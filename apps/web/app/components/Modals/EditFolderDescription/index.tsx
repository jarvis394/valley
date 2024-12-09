import React from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './EditFolderDescription.module.css'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import TextArea from '@valley/ui/TextArea'
import { Form, useLocation, useParams, useSearchParams } from '@remix-run/react'
import { FoldersEditSchema } from 'app/routes/api+/folders+/$id.edit'
import { useRemixForm } from 'remix-hook-form'
import { useIsPending } from 'app/utils/misc'

type FormData = z.infer<typeof FoldersEditSchema>

const resolver = zodResolver(FoldersEditSchema)

type EditFolderDescriptionModalProps = {
  onClose: () => void
}

const EditFolderDescriptionModal: React.FC<EditFolderDescriptionModalProps> = ({
  onClose,
}) => {
  const location = useLocation()
  const { folderId: paramsFolderId } = useParams()
  const [searchParams] = useSearchParams()
  const modalPropsFolderId = searchParams.get('modal-folderId')
  const defaultDescription = location.state?.defaultDescription
  const folderId = modalPropsFolderId || paramsFolderId
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
    <>
      <ModalHeader>Edit Folder Description</ModalHeader>
      <Form
        onSubmit={handleSubmit}
        className={styles.editFolderDescription__form}
        id="edit-folder-description-form"
        method="POST"
        action={formAction}
      >
        <div>
          <TextArea
            {...register('description')}
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
    </>
  )
}

export default EditFolderDescriptionModal
