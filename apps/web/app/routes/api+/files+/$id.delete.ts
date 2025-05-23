import { redirect } from 'react-router'
import { covers, db, files, folders, projects, and, eq } from '@valley/db'
import { redirectToKey } from 'app/config/paramsKeys'
import { requireUser } from 'app/server/auth/auth.server'
import { FileService } from 'app/server/services/file.server'
import { invariantResponse } from 'app/utils/invariant'
import { Route } from './+types/$id.delete'

export const loader = () => redirect('/projects')

export const action = async ({ request, params }: Route.ActionArgs) => {
  const user = await requireUser(request)
  const { id } = params
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get(redirectToKey)

  invariantResponse(id, 'No file ID found in params')

  try {
    const { file, folder, project } =
      await FileService.getWithUserProjectAndFolder({
        userId: user.id,
        fileId: id,
      })

    invariantResponse(file, 'File not found', { status: 404 })
    invariantResponse(folder, 'Folder not found', { status: 404 })
    invariantResponse(project, 'Project not found', { status: 404 })

    await db.transaction(async (tx) => {
      if (!folder || !project || !file.folderId) return

      const newFolderTotalFiles = folder.totalFiles - 1
      const newFolderTotalSize = Number(folder.totalSize) - Number(file.size)
      const newProjectTotalFiles = project.totalFiles - 1
      const newProjectTotalSize = Number(project.totalSize) - Number(file.size)
      const deleteCoverPromise = tx
        .delete(covers)
        .where(
          and(
            eq(covers.fileId, file.id),
            eq(covers.projectId, covers.projectId)
          )
        )
      const deleteFilePromise = tx.delete(files).where(eq(files.id, file.id))
      const deleteFileFromStoragePromise = FileService.deleteFromStorageByPath(
        file.path
      )
      const updateFolderSizePromise = tx
        .update(folders)
        .set({
          totalFiles: newFolderTotalFiles,
          totalSize: newFolderTotalSize.toString(),
        })
        .where(eq(folders.id, file.folderId))
      const updateProjectSizePromise = tx
        .update(projects)
        .set({
          totalFiles: newProjectTotalFiles,
          totalSize: newProjectTotalSize.toString(),
        })
        .where(eq(projects.id, folder.projectId))

      await Promise.all([
        deleteCoverPromise,
        deleteFilePromise,
        deleteFileFromStoragePromise,
        updateFolderSizePromise,
        updateProjectSizePromise,
      ])
    })

    if (redirectTo) return redirect(redirectTo)
    if (folder)
      return redirect(
        '/projects/' + folder.projectId + '/folder/' + file.folderId
      )
    else return '/projects'
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
