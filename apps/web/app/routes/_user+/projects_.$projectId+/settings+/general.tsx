import type { Project } from '@valley/db'
import Stack from '@valley/ui/Stack'
import TextField from '@valley/ui/TextField'
import Fieldset from 'app/components/Fieldset/Fieldset'
import { useProjectAwait } from 'app/utils/project'
import React from 'react'
import { z } from 'zod'
import { ProjectWithFolders } from '@valley/shared'

const ProjectEditSchema: z.ZodType<Project> = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  totalFiles: z.number(),
  totalSize: z.string(),
  dateCreated: z.date(),
  dateUpdated: z.date(),
  dateShot: z.date(),
  storedUntil: z.date().or(z.null()),
  language: z.string(),
  protected: z.boolean(),
  password: z.string().or(z.null()),
  userId: z.string(),
  translationStringsId: z.number().or(z.null()),
})

const ProjectSettingsGeneral: React.FC<{
  project?: ProjectWithFolders | null
}> = ({ project }) => {
  return (
    <Stack direction={'column'} gap={4} fullWidth>
      <Fieldset
        title={'Project Name'}
        subtitle={'Unique name of your Project on the Dashboard.'}
        schema={ProjectEditSchema}
        id="project-name-form"
      >
        {({ register, getFieldState, formState }) => (
          <TextField
            {...register('title')}
            fieldState={getFieldState('title', formState)}
            defaultValue={project?.title}
            size="lg"
            placeholder="my-project"
          />
        )}
      </Fieldset>
      <Fieldset
        title={'Project URL'}
        subtitle={
          'Used to uniquely identify your Project in the URL of your deployments.'
        }
        before={'Only letters a-z and numbers 0-9 are allowed'}
        schema={ProjectEditSchema}
        id="project-url-form"
      >
        {({ register, getFieldState, formState }) => (
          <TextField
            {...register('url')}
            fieldState={getFieldState('url', formState)}
            defaultValue={project?.url}
            size="lg"
            placeholder="Unique project URL"
          />
        )}
      </Fieldset>
      <Fieldset
        title={'Metadata and Storage'}
        before={'Only letters a-z and numbers 0-9 are allowed'}
        schema={ProjectEditSchema}
        id="project-url-form"
      >
        {({ register, getFieldState, formState }) => (
          <TextField
            {...register('url')}
            fieldState={getFieldState('url', formState)}
            size="lg"
            placeholder="Unique project URL"
          />
        )}
      </Fieldset>
      <Fieldset
        title={'Delete Project'}
        subtitle={
          'The project will be permanently deleted, including its files and deployments. This action is irreversible and cannot be undone.'
        }
        submitLabel={'Delete'}
        submitProps={{
          variant: 'danger',
        }}
        schema={ProjectEditSchema}
        variant="danger"
        id="project-delete-form"
      />
    </Stack>
  )
}

const ProjectSettingsGeneralRoute = () => {
  const data = useProjectAwait()

  return <ProjectSettingsGeneral project={data.project} />
}

export default ProjectSettingsGeneralRoute
