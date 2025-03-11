import { zodResolver } from '@hookform/resolvers/zod'
import { data, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { requireUser } from 'app/server/auth/auth.server'
import { covers, db, projects } from '@valley/db'
import { invariantResponse } from 'app/utils/invariant'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'
import { sql, eq, and } from 'drizzle-orm'

export const ProjectSetCoverSchema = z.object({
  fileId: z.string(),
})

type FormData = z.infer<typeof ProjectSetCoverSchema>

const resolver = zodResolver(ProjectSetCoverSchema)

export const loader = () => redirect('/projects')

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const projectId = params.id
  const user = await requireUser(request)
  const isUsersProject = db
    .select({
      id: sql`1`,
    })
    .from(projects)
    .where(eq(projects.userId, user.id))
    .as('isUsersProject')

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

  const cover = await db.query.covers.findFirst({
    where: and(eq(covers.projectId, projectId), isUsersProject),
    with: {
      file: {
        with: {
          folder: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
  })
  const folderId = cover?.file.folder?.id

  invariantResponse(cover, 'Project not found', { status: 404 })

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

  if (folderId) {
    return redirect('/projects/' + projectId + '/folder/' + folderId)
  } else {
    return redirect('/projects/' + projectId)
  }
}
