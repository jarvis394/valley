import { zodResolver } from '@hookform/resolvers/zod'
import { data, redirect } from 'react-router'
import { requireUser } from 'app/server/auth/auth.server'
import { covers, db } from '@valley/db'
import { invariantResponse } from 'app/utils/invariant'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'
import { ProjectService } from 'app/server/services/project.server'
import { FileService } from 'app/server/services/file.server'
import { Route } from './+types/$id.setCover'

export const ProjectSetCoverSchema = z.object({
  fileId: z.string(),
})

type FormData = z.infer<typeof ProjectSetCoverSchema>

const resolver = zodResolver(ProjectSetCoverSchema)

export const loader = () => redirect('/projects')

export const action = async ({ request, params }: Route.ActionArgs) => {
  const projectId = params.id
  const user = await requireUser(request)

  invariantResponse(projectId, 'Missing project ID', { status: 400 })

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

  const project = await ProjectService.getUserProject({
    userId: user.id,
    projectId,
  })
  invariantResponse(project, 'Project not found', { status: 404 })

  const file = await FileService.getUserFile({
    userId: user.id,
    fileId: submissionData.fileId,
  })
  invariantResponse(file.files.id, 'File not found', { status: 404 })

  await db
    .insert(covers)
    .values({
      fileId: submissionData.fileId,
      projectId,
    })
    .onConflictDoUpdate({
      target: covers.projectId,
      set: {
        fileId: submissionData.fileId,
      },
    })

  if (file.files.folderId) {
    return redirect('/projects/' + projectId + '/folder/' + file.files.folderId)
  } else {
    return redirect('/projects/' + projectId)
  }
}
