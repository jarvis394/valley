import React, { useState } from 'react'
import Button from '@valley/ui/Button'
import ModalHeader from '@valley/ui/ModalHeader'
import ModalFooter from '@valley/ui/ModalFooter'
import { useRemixForm } from 'remix-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '@valley/ui/TextField'
import { Form, useFetcher } from 'react-router'
import {
  ProjectsCreateSchema,
  type action as createAction,
} from 'app/routes/api+/projects+/create'
import ModalContent from '@valley/ui/ModalContent'
import SelectField from '@valley/ui/SelectField'
import Select from '@valley/ui/Select'
import dayjs from 'dayjs'
import Stack from '@valley/ui/Stack'
import Switch from '@valley/ui/Switch'
import { RefreshClockwise } from 'geist-ui-icons'
import IconButton from '@valley/ui/IconButton'
import Label from '@valley/ui/Label'
import AnimateChangeInHeight from '@valley/ui/AnimateChangeInHeight'

type FormData = z.infer<typeof ProjectsCreateSchema>

const resolver = zodResolver(ProjectsCreateSchema)

type CreateProjectModalProps = {
  onClose: () => void
}

const generatePassword = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'
  let res = ''
  for (let i = 0; i < 10; i++) {
    const n = Math.floor(Math.random() * chars.length)
    res += chars[n]
  }
  return res
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose }) => {
  const fetcher = useFetcher<typeof createAction>({
    key: 'projects-create',
  })
  const { register, handleSubmit, setValue } = useRemixForm<FormData>({
    resolver,
    submitConfig: {
      action: '/api/projects/create',
      method: 'POST',
    },
    fetcher,
  })
  const isPending = fetcher.state !== 'idle'
  const [storeUntilHelperText, setStoreUntilHelperText] = useState<
    string | undefined
  >()
  const [shouldShowPasswordBox, setShouldShowPasswordBox] = useState(false)
  const [withPassword, setWithPassword] = useState(false)

  const handleStoreUntilChange: React.ReactEventHandler<HTMLSelectElement> = (
    e
  ) => {
    const value = e.currentTarget.value
    if (value === 'unlimited') {
      return setStoreUntilHelperText(undefined)
    }

    const storedUntil = dayjs().add(Number(value), 'months')
    setStoreUntilHelperText('Expires on ' + storedUntil.format('D MMMM, YYYY'))
  }

  const handleVisibilityChange: React.ReactEventHandler<HTMLSelectElement> = (
    e
  ) => {
    const value = e.currentTarget.value
    setShouldShowPasswordBox(value === 'private')
  }

  const handlePasswordSwitchChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (e) => {
    const value = e.currentTarget.checked
    setWithPassword(value)
  }

  const formatStoreUntilValue = (value: string | number) => {
    if (value === 'unlimited') return undefined
    else return dayjs().add(Number(value), 'months')
  }

  const formatDateShotValue = (value: string) => {
    if (!value) return undefined
    else return dayjs(value).toDate()
  }

  const regeneratePassword = (e: React.SyntheticEvent) => {
    e.preventDefault()
    setValue('password', generatePassword())
  }

  return (
    <>
      <ModalHeader>Create Project</ModalHeader>
      <ModalContent asChild>
        <Form
          onSubmit={handleSubmit}
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
          <SelectField
            {...register('storedUntil', {
              setValueAs: formatStoreUntilValue,
            })}
            id="stored-until-select"
            label="Store until"
            defaultValue={'unlimited'}
            fullWidth
            required
            formHelperTextProps={{ style: { paddingBottom: 0 } }}
            helperText={storeUntilHelperText}
            onChange={handleStoreUntilChange}
          >
            <Select.Item value={'unlimited'}>Unlimited</Select.Item>
            <Select.Item value={'1'}>1 month</Select.Item>
            <Select.Item value={'3'}>3 months</Select.Item>
            <Select.Item value={'6'}>6 months</Select.Item>
            <Select.Item value={'12'}>1 year</Select.Item>
          </SelectField>
          <Stack gap={2} direction={'column'} asChild>
            <AnimateChangeInHeight>
              <SelectField
                {...register('visibility')}
                id="visibility-select"
                label="Visibility"
                defaultValue={'public'}
                fullWidth
                required
                formHelperTextProps={{ style: { paddingBottom: 0 } }}
                onChange={handleVisibilityChange}
              >
                <Select.Item value={'public'}>Public</Select.Item>
                <Select.Item value={'private'}>Private</Select.Item>
              </SelectField>
              {shouldShowPasswordBox && (
                <Stack gap={4} align={'center'}>
                  <TextField
                    {...register('password', {
                      value: generatePassword(),
                    })}
                    after={
                      <IconButton
                        onClick={regeneratePassword}
                        variant="tertiary-dimmed"
                      >
                        <RefreshClockwise />
                      </IconButton>
                    }
                    size="lg"
                    id="password"
                    disabled={!withPassword}
                    fullWidth
                  />
                  <Label size="lg" standalone htmlFor="password-switch">
                    Password
                  </Label>
                  <Switch
                    {...register('withPassword', {
                      value: withPassword,
                    })}
                    defaultChecked={withPassword}
                    onChange={handlePasswordSwitchChange}
                    id="password-switch"
                  />
                </Stack>
              )}
            </AnimateChangeInHeight>
          </Stack>
          <TextField
            {...register('dateShot', {
              setValueAs: formatDateShotValue,
            })}
            label="Date shot"
            size="lg"
            id="date-shot-input"
            type="date"
            placeholder="dd.mm.yyyy"
          />
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
