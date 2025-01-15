import { zodResolver } from '@hookform/resolvers/zod'
import { data, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { requireUser } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'
import { FoldersEditSchema } from './$id.edit'
import { FieldErrors } from 'react-hook-form'
import { PROJECT_MAX_FOLDERS } from '@valley/shared'

export const FoldersCreateSchema = z
  .object({
    projectId: z.string(),
  })
  .and(FoldersEditSchema)

type FormData = z.infer<typeof FoldersCreateSchema>

const resolver = zodResolver(FoldersCreateSchema)

export const loader = () => redirect('/projects')

export const action = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request)

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

  const userProject = await prisma.project.findFirst({
    where: { id: submissionData.projectId, userId: user.id },
    include: { folders: true },
  })

  if (!userProject) {
    return data(
      {
        ok: false,
        errors: {
          title: {
            type: 'validate',
            message: `Project ${submissionData.projectId} not found`,
          },
        } satisfies FieldErrors<FormData>,
        defaultValues,
      },
      {
        status: 404,
      }
    )
  }

  if (userProject.folders.length >= PROJECT_MAX_FOLDERS) {
    return data(
      {
        ok: false,
        errors: {
          title: {
            type: 'validate',
            message: `You can have only ${PROJECT_MAX_FOLDERS} folders in a project`,
          },
        } satisfies FieldErrors<FormData>,
        defaultValues,
      },
      {
        status: 403,
      }
    )
  }

  const folder = await prisma.folder.create({
    data: {
      title: submissionData.title || 'Folder',
      description: submissionData.description || null,
      isDefaultFolder: false,
      Project: {
        connect: {
          id: submissionData.projectId,
        },
      },
    },
  })

  return redirect(
    '/projects/' + submissionData.projectId + '/folder/' + folder.id
  )
}
