import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getUserIdFromSession } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { projectId } = params
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
