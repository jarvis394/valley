import React from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, useSearchParams } from 'react-router'
import { useRemixForm } from 'remix-hook-form'
import { useIsPending } from 'app/utils/misc'
import { useProjectAwait } from 'app/utils/project'
import { ProjectWithFolders } from '@valley/shared'
import Stack from '@valley/ui/Stack'
import Spinner from '@valley/ui/Spinner'
import ModalContent from '@valley/ui/ModalContent'
import { ProjectSetCoverSchema } from 'app/routes/api+/projects+/$id.setCover'
import ErrorModalContent from '../ErrorModalContent'
import Note from '@valley/ui/Note'

type FormData = z.infer<typeof ProjectSetCoverSchema>

const resolver = zodResolver(ProjectSetCoverSchema)

type SetProjectCoverModalProps = {
  onClose: () => void
}

const ModalContents: React.FC<
  SetProjectCoverModalProps & {
    project?: ProjectWithFolders | null
  }
> = ({ onClose, project }) => {
  const [searchParams] = useSearchParams()
  const fileId = searchParams.get('modal-fileId')
  const formAction = '/api/projects/' + project?.id + '/setCover'
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

  if (!fileId) {
    return (
      <ErrorModalContent onClose={onClose} title="Set Cover">
        Missing file ID
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
          <Note variant="success" fill>
            You are setting file {fileId} as project cover
          </Note>
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
  const { ProjectAwait } = useProjectAwait()

  return (
    <ProjectAwait
      fallback={() => (
        <>
          <ModalHeader>Set Cover</ModalHeader>
          <Stack padding={[4, 4, 8, 4]} align={'center'} justify={'center'}>
            <Spinner />
          </Stack>
        </>
      )}
    >
      {(data) => <ModalContents onClose={onClose} project={data.project} />}
    </ProjectAwait>
  )
}

export default SetProjectCoverModal
