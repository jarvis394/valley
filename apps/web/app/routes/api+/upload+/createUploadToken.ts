import { zodResolver } from '@hookform/resolvers/zod'
import { data, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { requireUser } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { FieldErrors } from 'react-hook-form'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { randomString } from 'app/server/utils/misc.server'

export const UploadTokenCreateSchema = z.object({
  projectId: z.string(),
  folderId: z.string(),
})

type FormData = z.infer<typeof UploadTokenCreateSchema>

const resolver = zodResolver(UploadTokenCreateSchema)

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

  const uploadFolder = await prisma.folder.findFirst({
    where: {
      id: submissionData.folderId,
      Project: {
        id: submissionData.projectId,
        userId: user.id,
      },
    },
    select: {
      id: true,
      projectId: true,
    },
  })

  if (!uploadFolder) {
    return data(
      {
        ok: false,
        defaultValues,
        errors: {
          folderId: {
            type: 'value',
            message: 'Upload folder does not exist',
          },
        } satisfies FieldErrors<FormData>,
      },
      {
        status: 404,
      }
    )
  }

  const hashString = [
    randomString(8),
    Date.now().toString(),
    user.id,
    uploadFolder.id,
    uploadFolder.projectId,
  ].join(',')
  const hash = await bcrypt.hash(hashString, 10)

  const uploadToken = await prisma.uploadToken.create({
    data: {
      hash,
      uploadFolderId: uploadFolder.id,
      uploadProjectId: uploadFolder.projectId,
      userId: user.id,
    },
  })

  return data({
    ok: true,
    data: uploadToken,
    defaultValues,
    errors: {},
  })
}
