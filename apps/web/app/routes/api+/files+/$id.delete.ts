import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { covers, db, files, folders, projects } from '@valley/db'
import { redirectToKey } from 'app/config/paramsKeys'
import { requireUser } from 'app/server/auth/auth.server'
import { getFileWithUserProjectAndFolder } from 'app/server/services/file.server'
import { invariantResponse } from 'app/utils/invariant'
import { and, eq } from 'drizzle-orm'

export const loader = () => redirect('/projects')

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request)
  const { id } = params
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get(redirectToKey)

  invariantResponse(id, 'No file ID found in params')

  try {
    const { file, folder, project } = await getFileWithUserProjectAndFolder({
      userId: user.id,
      fileId: id,
    })

    invariantResponse(file, 'File not found', { status: 404 })

    if (folder) {
      await db.transaction(async (tx) => {
        if (!folder || !project || !file.folderId) return

        const newFolderTotalFiles = folder.totalFiles - 1
        const newFolderTotalSize = Number(folder.totalSize) - Number(file.size)
        const newProjectTotalFiles = project.totalFiles - 1
        const newProjectTotalSize =
          Number(project.totalSize) - Number(file.size)

        await tx
          .delete(covers)
          .where(
            and(
              eq(covers.fileId, file.id),
              eq(covers.projectId, covers.projectId)
            )
          )
        await tx
          .update(files)
          .set({ deletedAt: new Date(), folderId: null })
          .where(eq(files.id, file.id))
        await tx
          .update(folders)
          .set({
            totalFiles: newFolderTotalFiles,
            totalSize: newFolderTotalSize.toString(),
          })
          .where(eq(folders.id, file.folderId))
        await tx
          .update(projects)
          .set({
            totalFiles: newProjectTotalFiles,
            totalSize: newProjectTotalSize.toString(),
          })
          .where(eq(projects.id, folder.projectId))
      })
    }

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
