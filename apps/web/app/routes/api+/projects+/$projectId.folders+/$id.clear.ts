import { redirect } from 'react-router'
import { db, files, folders, projects } from '@valley/db'
import { redirectToKey } from 'app/config/paramsKeys'
import { requireUser } from 'app/server/auth/auth.server'
import { getProjectFolderAndProject } from 'app/server/services/folder.server'
import { invariantResponse } from 'app/utils/invariant'
import { eq } from 'drizzle-orm'
import { Route } from './+types/$id.clear'

export const loader = () => redirect('/projects')

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request)
  const { id, projectId } = params
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get(redirectToKey)

  invariantResponse(id, 'No folder ID found in params')
  invariantResponse(projectId, 'No project ID found in params')

  try {
    const { folders: folder, projects: project } =
      await getProjectFolderAndProject({
        folderId: id,
        projectId,
        userId: user.id,
      })

    invariantResponse(folder, 'Folder not found', { status: 404 })

    await db.transaction(async (tx) => {
      const newTotalFiles = project.totalFiles - folder.totalFiles
      const newTotalSize = Number(project.totalSize) - Number(folder.totalSize)

      await tx
        .update(files)
        .set({ deletedAt: new Date(), folderId: null })
        .where(eq(files.folderId, folder.id))
      await tx
        .update(folders)
        .set({ totalFiles: 0, totalSize: '0' })
        .where(eq(folders.id, folder.id))
      await tx
        .update(projects)
        .set({ totalFiles: newTotalFiles, totalSize: newTotalSize.toString() })
        .where(eq(projects.id, folder.projectId))
    })

    return redirect(
      redirectTo || '/projects/' + folder.projectId + '/folder/' + folder.id
    )
  } catch (e) {
    if (e instanceof Response) {
      throw e
    }

    console.log(e)
    throw new Response('Unknown error occurred', {
      status: 500,
    })
  }
}
