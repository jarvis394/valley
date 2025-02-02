import { type LoaderFunctionArgs, redirect } from 'react-router'
import {
  getUserIdFromSession,
  requireLoggedIn,
} from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { invariantResponse } from 'app/utils/invariant'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireLoggedIn(request)

  const { projectId } = params
  invariantResponse(projectId, 'Missing project ID in route params')

  const userId = await getUserIdFromSession(request)
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      folders: true,
    },
  })
  const defaultFolder = project?.folders.find((e) => e.isDefaultFolder)

  if (!project || !defaultFolder) return redirect('/projects')

  return redirect('/projects/' + project.id + '/folder/' + defaultFolder.id)
}
