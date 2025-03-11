import { zodResolver } from '@hookform/resolvers/zod'
import { data, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { db, folders, projects } from '@valley/db'
import { eq, and, sql } from 'drizzle-orm'
import { requireUser } from 'app/server/auth/auth.server'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'
import { invariantResponse } from 'app/utils/invariant'

export const PROJECT_FOLDER_TITLE_MAX_LENGTH = 64
export const PROJECT_FOLDER_DESCRIPTION_MAX_LENGTH = 4096

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
    return data(
      { ok: false, errors, defaultValues },
      {
        status: 400,
      }
    )
  }

  invariantResponse(id, 'No folder ID found in params')

  try {
    const isUsersProject = db
      .select({
        id: sql`1`,
      })
      .from(projects)
      .where(eq(projects.userId, user.id))
      .as('isUsersProject')

    const [folder] = await db
      .update(folders)
      .set(submissionData)
      .where(and(eq(folders.id, id), isUsersProject))
      .returning()

    return redirect('/projects/' + folder.projectId + '/folder/' + folder.id)
  } catch (_e) {
    return data(
      {
        ok: false,
        errors: {
          title: `Folder ${id} not found`,
        },
        defaultValues,
      },
      {
        status: 500,
      }
    )
  }
}
