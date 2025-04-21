import React from 'react'
import { data, useParams } from 'react-router'
import SettingsLayout from 'app/components/SettingsLayout/SettingsLayout'
import Stack from '@valley/ui/Stack'
import Divider from '@valley/ui/Divider'
import PageHeader from 'app/components/PageHeader/PageHeader'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { requireUser } from 'app/server/auth/auth.server'
import { Route } from './+types/_layout'
import { getValidatedFormData } from 'remix-hook-form'
import { type NewProject } from '@valley/db'
import { ProjectService } from 'app/server/services/project.server'
import { redirectWithToast } from 'app/server/toast.server'

const PROJECT_SETTINGS_TABS = [
  { label: 'General', to: '/general' },
  { label: 'Translation', to: '/translation' },
  { label: 'Protection', to: '/protection' },
]

export const ProjectEditSchema: z.ZodType<
  Partial<
    Pick<
      NewProject,
      'title' | 'slug' | 'dateShot' | 'storedUntil' | 'language' | 'protected'
    > & {
      password?: string | null
    }
  >
> = z
  .object({
    title: z.string(),
    slug: z.string(),
    dateShot: z.date(),
    storedUntil: z.date().or(z.null()),
    language: z.string(),
    protected: z.boolean(),
    password: z.string().or(z.null()),
  })
  .partial()

const resolver = zodResolver(ProjectEditSchema)
type FormData = z.infer<typeof ProjectEditSchema>

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request)
  const { projectId } = params
  const {
    errors,
    data: submissionData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver)
  if (errors) {
    return data(
      { ok: false, errors, defaultValues },
      {
        status: 400,
      }
    )
  }

  try {
    await ProjectService.updateUserProject({
      data: submissionData,
      userId: user.id,
      projectId,
    })
    return redirectWithToast(request.url, {
      description: 'Updated project ' + Object.keys(submissionData).join(','),
      type: 'info',
    })
  } catch (e) {
    return redirectWithToast(request.url, {
      description: (e as Error).message,
    })
  }
}

const ProjectSettingsLayout = () => {
  const { projectId } = useParams()
  const basePath = `/projects/${projectId}/settings`

  return (
    <Stack direction={'column'} fullWidth>
      <PageHeader>Project Settings</PageHeader>
      <Divider />
      <SettingsLayout basePath={basePath} tabs={PROJECT_SETTINGS_TABS} />
    </Stack>
  )
}

export default ProjectSettingsLayout
