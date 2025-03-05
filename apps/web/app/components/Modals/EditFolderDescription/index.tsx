import React from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import TextArea from '@valley/ui/TextArea'
import { Form, useParams, useSearchParams } from '@remix-run/react'
import { FoldersEditSchema } from 'app/routes/api+/folders+/$id.edit'
import { useRemixForm } from 'remix-hook-form'
import { useIsPending } from 'app/utils/misc'
import { ProjectWithFolders } from '@valley/shared'
import { useProject } from 'app/utils/project'
import ModalContent from '@valley/ui/ModalContent'

type FormData = z.infer<typeof FoldersEditSchema>

const resolver = zodResolver(FoldersEditSchema)

type EditFolderDescriptionModalProps = { onClose: () => void }

const ModalContents: React.FC<
  EditFolderDescriptionModalProps & { project?: ProjectWithFolders | null }
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
    submitConfig: { action: formAction, method: 'POST' },
  })
  const isPending = useIsPending({ formMethod: 'POST', formAction })

  return (
    <>
      <ModalHeader>Edit Folder Description</ModalHeader>
      <ModalContent asChild>
        <Form
          onSubmit={handleSubmit}
          id="edit-folder-description-form"
          method="POST"
          action={formAction}
        >
          <div>
            <TextArea
              {...register('description', { value: defaultDescription })}
              size="lg"
              defaultValue={defaultDescription}
              id="folder-description-input"
              placeholder="Write here anything..."
            />
          </div>
        </Form>
      </ModalContent>
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

const EditFolderDescriptionModal: React.FC<EditFolderDescriptionModalProps> = ({
  onClose,
}) => {
  const project = useProject()

  return <ModalContents onClose={onClose} project={project} />
}

export default EditFolderDescriptionModal
