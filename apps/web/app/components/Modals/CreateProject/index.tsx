import React from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './CreateProject.module.css'
import { useRemixForm } from 'remix-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useIsPending } from 'app/utils/misc'
import TextField from '@valley/ui/TextField'

const CreateProjectSchema = z.object({
  projectName: z.string(),
  dateShot: z.date(),
})

type FormData = z.infer<typeof CreateProjectSchema>

const resolver = zodResolver(CreateProjectSchema)

type CreateProjectModalProps = {
  onClose: () => void
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose }) => {
  // const router = useRouter()
  const { register, handleSubmit } = useRemixForm<FormData>({
    resolver,
  })
  const isPending = useIsPending()

  // const onSubmit = async (e) => {
  //   setIsLoading(true)
  //   // const res = await createProject({
  //   //   dateShot: values.dateShot,
  //   //   protected: false,
  //   //   title: values.projectName,
  //   //   storedUntil: new Date(),
  //   //   translationStringsId: null,
  //   // })

  //   onClose()
  //   // router.replace('/projects/' + res.project.id)
  // }

  return (
    <>
      <ModalHeader>Create Project</ModalHeader>
      <form
        id="create-project-form"
        className={styles.createProjectModal__form}
        onSubmit={handleSubmit}
      >
        <div>
          <TextField
            {...register('projectName')}
            label="Project Name"
            required
            size="lg"
            id="project-name-input"
            placeholder="my-project"
          />
        </div>
        <div>
          <TextField
            label="Store until"
            required
            size="lg"
            id="store-until-select"
            placeholder="my-project"
          />
        </div>
        <div>
          <TextField
            label="Visibility"
            required
            size="lg"
            id="visibility-select"
            placeholder="my-project"
          />
        </div>
        <div>
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
        </div>
      </form>
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
