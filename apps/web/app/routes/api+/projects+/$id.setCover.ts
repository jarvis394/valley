import { zodResolver } from '@hookform/resolvers/zod'
import { data, LoaderFunctionArgs, redirect } from 'react-router'
import { requireUser } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { invariantResponse } from 'app/utils/invariant'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'

export const ProjectSetCoverSchema = z.object({
  fileId: z.string(),
})

type FormData = z.infer<typeof ProjectSetCoverSchema>

const resolver = zodResolver(ProjectSetCoverSchema)

export const loader = () => redirect('/projects')

export const action = async ({ request, params }: LoaderFunctionArgs) => {
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

  const cover = await prisma.cover.findFirst({
    where: {
      Project: {
        id: projectId,
        userId: user.id,
      },
    },
    include: {
      File: {
        include: {
          Folder: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })
  const folderId = cover?.File.Folder?.id

  invariantResponse(cover, 'Project not found', { status: 404 })

  await prisma.cover.upsert({
    where: {
      id: cover.id,
    },
    update: {
      fileId: submissionData.fileId,
    },
    create: {
      fileId: submissionData.fileId,
      projectId,
    },
  })

  if (folderId) {
    return redirect('/projects/' + projectId + '/folder/' + folderId)
  } else {
    return redirect('/projects/' + projectId)
  }
}
