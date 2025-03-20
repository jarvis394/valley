import React, { useState } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from 'react-router'
import { useRemixForm } from 'remix-hook-form'
import { useIsPending } from 'app/utils/misc'
import { useProject } from 'app/utils/project'
import { ProjectWithFolders } from '@valley/shared'
import { File } from '@valley/db'
import ModalContent from '@valley/ui/ModalContent'
import { ProjectSetCoverSchema } from 'app/routes/api+/projects+/$id.setCover'
import ErrorModalContent from '../ErrorModalContent'
import styles from './SetProjectCover.module.css'
import { useFiles } from 'app/utils/files'
import Image from '@valley/ui/Image'

type FormData = z.infer<typeof ProjectSetCoverSchema>

const resolver = zodResolver(ProjectSetCoverSchema)

type SetProjectCoverModalProps = { onClose: () => void }

const ModalContents: React.FC<
  SetProjectCoverModalProps & {
    project?: ProjectWithFolders | null
    files?: File[] | null
  }
> = ({ onClose, project, files }) => {
  const searchParams = new URLSearchParams(window.location.search)
  const [fileId] = useState(searchParams.get('modal-fileId'))
  const file = files?.find((e) => e.id === fileId)
  const formAction = '/api/projects/' + project?.id + '/setCover'
  const { register, handleSubmit } = useRemixForm<FormData>({
    resolver,
    submitConfig: {
      action: formAction,
      method: 'POST',
      navigate: true,
      preventScrollReset: true,
    },
  })
  const isPending = useIsPending({ formMethod: 'POST', formAction })

  if (!file) {
    return (
      <ErrorModalContent onClose={onClose} title="Set Cover">
        File not found
      </ErrorModalContent>
    )
  }

  return (
    <>
      <ModalHeader>Set Cover</ModalHeader>
      <ModalContent asChild>
        <Form
          onSubmit={handleSubmit}
          id="set-project-cover-form"
          action={formAction}
          method="POST"
        >
          <input
            {...register('fileId', { required: true })}
            value={fileId || ''}
            hidden
          />
          <Image
            file={file}
            thumbnail="md"
            containerProps={{ className: styles.image }}
          />
          <p>
            You are setting file <b>&quot;{file.name}&quot;</b> as project cover
          </p>
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
            form="set-project-cover-form"
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

const SetProjectCoverModal: React.FC<SetProjectCoverModalProps> = ({
  onClose,
}) => {
  const project = useProject()
  const files = useFiles()

  return <ModalContents onClose={onClose} project={project} files={files} />
}

export default SetProjectCoverModal
