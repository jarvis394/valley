import { redirect } from 'react-router'
import { requireUserId } from 'app/server/auth/auth.server'
import { invariantResponse } from 'app/utils/invariant'
import { ProjectService } from 'app/server/services/project.server'
import { Route } from './+types/_index'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { projectId } = params
  invariantResponse(projectId, 'Missing project ID in route params')

  const userId = await requireUserId(request)
  const project = await ProjectService.getUserProject({ userId, projectId })
  const defaultFolder = project?.folders.find((e) => e.isDefaultFolder)

  if (!project || !defaultFolder) return redirect('/projects')

  return redirect('/projects/' + project.id + '/folder/' + defaultFolder.id)
}
