import React from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import * as Dialog from '@valley/ui/Modal'
import styles from '../Modals.module.css'
import { useRemixForm } from 'remix-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '@valley/ui/TextField'
import { Form, useFetcher } from '@remix-run/react'
import {
  ProjectsCreateSchema,
  type action as createAction,
} from 'app/routes/api+/projects+/create'

type FormData = z.infer<typeof ProjectsCreateSchema>

const resolver = zodResolver(ProjectsCreateSchema)

type CreateProjectModalProps = {
  onClose: () => void
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = () => {
  const fetcher = useFetcher<typeof createAction>({
    key: 'projects-create',
  })
  const { register, handleSubmit } = useRemixForm<FormData>({
    resolver,
    submitConfig: {
      viewTransition: true,
      action: '/api/projects/create',
      method: 'POST',
    },
    fetcher,
  })
  const isPending = fetcher.state !== 'idle'

  return (
    <>
      <ModalHeader>Create Project</ModalHeader>
      <Form
        onSubmit={handleSubmit}
        className={styles.modal__content}
        id="create-project-form"
        method="POST"
        action="/api/projects/create"
      >
        <TextField
          {...register('projectName')}
          label="Project Name"
          required
          size="lg"
          id="project-name-input"
          placeholder="my-project"
        />
        <TextField
          label="Store until"
          required
          size="lg"
          id="store-until-select"
          placeholder="my-project"
        />
        <TextField
          label="Visibility"
          required
          size="lg"
          id="visibility-select"
          placeholder="my-project"
        />
        <TextField
          {...register('dateShot', {
            valueAsDate: true,
          })}
          label="Date shot"
          size="lg"
          id="date-shot-input"
          type="date"
          placeholder="dd.mm.yyyy"
        />
      </Form>
      <ModalFooter
        before={
          <Dialog.Close asChild>
            <Button disabled={isPending} variant="secondary-dimmed" size="md">
              Cancel
            </Button>
          </Dialog.Close>
        }
        after={
          <Button
            form="create-project-form"
            variant="primary"
            size="md"
            type="submit"
            disabled={isPending}
            loading={isPending}
          >
            Create
          </Button>
        }
      />
    </>
  )
}

export default CreateProjectModal
