import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Folder } from '@valley/db'
import {
  PROJECT_FOLDER_DESCRIPTION_MAX_LENGTH,
  PROJECT_FOLDER_TITLE_MAX_LENGTH,
} from '@valley/shared'
import { requireUser } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { FieldErrors } from 'react-hook-form'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'

export const FoldersEditSchema = z.object({
  description: z
    .string()
    .trim()
    .min(0)
    .max(PROJECT_FOLDER_DESCRIPTION_MAX_LENGTH)
    .or(z.null())
    .optional(),
  title: z
    .string()
    .trim()
    .min(1)
    .max(PROJECT_FOLDER_TITLE_MAX_LENGTH)
    .optional(),
})

type FormData = z.infer<typeof FoldersEditSchema>

const resolver = zodResolver(FoldersEditSchema)

export const loader = () => redirect('/projects')

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request)
  const { id } = params

  const {
    errors,
    data: submissionData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver)
  if (errors) {
    return Response.json(
      { ok: false, errors, defaultValues },
      {
        status: 400,
      }
    )
  }

  let folder: Folder | null = null
  try {
    folder = await prisma.folder.update({
      where: { id, Project: { userId: user.id } },
      data: {
        ...submissionData,
      },
    })
  } catch (e) {
    return Response.json(
      {
        ok: true,
        errors: {
          title: {
            type: 'validate',
            message: `Folder ${id} not found`,
          },
        } satisfies FieldErrors<FormData>,
        defaultValues,
      },
      {
        status: 500,
      }
    )
  }

  return Response.json(
    {
      ok: true,
      folder,
    },
    {
      status: 200,
    }
  )
}
