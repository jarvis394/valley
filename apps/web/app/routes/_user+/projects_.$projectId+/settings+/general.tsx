import Stack from '@valley/ui/Stack'
import TextField from '@valley/ui/TextField'
import Fieldset from 'app/components/Fieldset/Fieldset'
import { useProject } from 'app/utils/project'
import React from 'react'
import { ProjectWithFolders } from '@valley/shared'
import { ProjectEditSchema, action as rootAction } from './_layout'

export const action = rootAction

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
            {...register('slug')}
            fieldState={getFieldState('slug', formState)}
            defaultValue={project?.slug}
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
            {...register('slug')}
            fieldState={getFieldState('slug', formState)}
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
  const data = useProject()

  return <ProjectSettingsGeneral project={data} />
}

export default ProjectSettingsGeneralRoute
