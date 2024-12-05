import React, { useState } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './EditFolderDescription.module.css'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import TextArea from '@valley/ui/TextArea'
import {
  Form,
  useLocation,
  useParams,
  useRevalidator,
  useSearchParams,
} from '@remix-run/react'
import { FoldersEditSchema } from 'app/routes/api+/folders+/$id.edit'
import { SubmitHandler, useForm } from 'react-hook-form'
import { editFolder } from 'app/api/folders'

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
  const { register, handleSubmit } = useForm<FormData>({ resolver })
  const [isPending, setPending] = useState(false)
  const revalidator = useRevalidator()

  const onSubmit: SubmitHandler<FormData> = async (data, e) => {
    e?.preventDefault()
    if (!folderId) return

    setPending(true)
    await editFolder({
      folderId,
      description: data.description,
    })
    setPending(false)
    onClose()
    revalidator.revalidate()
  }

  return (
    <>
      <ModalHeader>Edit Folder Description</ModalHeader>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.editFolderDescription__form}
        id="edit-folder-description-form"
        method="POST"
        action={'/api/folders/' + folderId + '/edit'}
      >
        <div>
          <TextArea
            {...register('description')}
            size="lg"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
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
