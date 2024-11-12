import React from 'react'
import Button from '@valley/ui/Button'
import Input from '@valley/ui/Input'
import InputLabel from '@valley/ui/InputLabel'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import styles from './CreateProject.module.css'
import { useRemixForm } from 'remix-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useIsPending } from 'app/utils/misc'

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
          <InputLabel htmlFor="project-name-input">Project Name *</InputLabel>
          <Input
            {...register('projectName')}
            id="project-name-input"
            placeholder="my-project"
          />
        </div>
        <div>
          <InputLabel htmlFor="store-until-select">Store until *</InputLabel>
          <Input id="store-until-select" placeholder="my-project" />
        </div>
        <div>
          <InputLabel htmlFor="visibility-select">Visibility *</InputLabel>
          <Input id="visibility-select" placeholder="my-project" />
        </div>
        <div>
          <InputLabel htmlFor="date-shot-input">Date shot</InputLabel>
          <Input
            {...register('dateShot', {
              valueAsDate: true,
            })}
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
