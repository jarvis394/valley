import { redirect } from 'react-router'
import { redirectToKey } from 'app/config/paramsKeys'
import { requireUser } from 'app/server/auth/auth.server'
import { invariantResponse } from 'app/utils/invariant'
import { db, files, folders, projects, eq, covers } from '@valley/db'
import { FolderService } from 'app/server/services/folder.server'
import { Route } from './+types/$id.delete'

export const loader = () => redirect('/projects')

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request)
  const { id, projectId } = params
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get(redirectToKey)

  invariantResponse(id, 'No folder ID found in params')
  invariantResponse(projectId, 'No project ID found in params')

  try {
    const { coverFile, folder, project } = await FolderService.getWithProject({
      folderId: id,
      projectId,
      userId: user.id,
    })

    invariantResponse(folder, 'Folder not found', { status: 404 })
    invariantResponse(!folder.isDefaultFolder, 'Cannot delete default folder', {
      status: 403,
    })

    await db.transaction(async (tx) => {
      const newTotalFiles = project.totalFiles - folder.totalFiles
      const newTotalSize = Number(project.totalSize) - Number(folder.totalSize)
      const deleteFilesPromise = tx
        .update(files)
        .set({ deletedAt: new Date(), folderId: null })
        .where(eq(files.folderId, folder.id))
      const deleteFolderPromise = tx
        .delete(folders)
        .where(eq(folders.id, folder.id))
      const updateProjectSizePromise = tx
        .update(projects)
        .set({
          totalFiles: newTotalFiles,
          totalSize: newTotalSize.toString(),
        })
        .where(eq(projects.id, folder.projectId))
      const deleteCoverPromise =
        coverFile?.folderId === id &&
        tx.delete(covers).where(eq(covers.projectId, folder.projectId))

      await Promise.all(
        [
          deleteFilesPromise,
          deleteFolderPromise,
          updateProjectSizePromise,
          deleteCoverPromise,
        ].filter(Boolean)
      )
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
