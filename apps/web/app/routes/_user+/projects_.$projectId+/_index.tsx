import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { db, projects } from '@valley/db'
import { requireUserId } from 'app/server/auth/auth.server'
import { invariantResponse } from 'app/utils/invariant'
import { and, eq } from 'drizzle-orm'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { projectId } = params
  invariantResponse(projectId, 'Missing project ID in route params')

  const userId = await requireUserId(request)
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
    with: {
      folders: true,
    },
  })
  const defaultFolder = project?.folders.find((e) => e.isDefaultFolder)

  if (!project || !defaultFolder) return redirect('/projects')

  return redirect('/projects/' + project.id + '/folder/' + defaultFolder.id)
}
