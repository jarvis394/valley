import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { db, files, folders, projects } from '@valley/db'
import { redirectToKey } from 'app/config/paramsKeys'
import { requireUser } from 'app/server/auth/auth.server'
import { invariantResponse } from 'app/utils/invariant'
import { and, eq, notExists, sql } from 'drizzle-orm'

export const loader = () => redirect('/projects')

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request)
  const { id } = params
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get(redirectToKey)
  const isUsersProject = db
    .select({
      id: sql`1`,
    })
    .from(projects)
    .where(eq(projects.userId, user.id))
    .as('isUsersProject')

  invariantResponse(id, 'No file ID found in params')

  try {
    const file = await db.query.files.findFirst({
      where: and(eq(files.id, id), isUsersProject, notExists(files.deletedAt)),
      with: {
        folder: {
          with: {
            project: true,
          },
        },
      },
    })

    invariantResponse(file, 'File not found', { status: 404 })

    if (file.folder) {
      await db.transaction(async (tx) => {
        if (!file.folder || !file.folderId) return

        const newFolderTotalFiles = file.folder.totalFiles - 1
        const newFolderTotalSize =
          Number(file.folder.totalSize) - Number(file.size)
        const newProjectTotalFiles = file.folder.project.totalFiles - 1
        const newProjectTotalSize =
          Number(file.folder.project.totalSize) - Number(file.size)

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
          .where(eq(projects.id, file.folder.projectId))
      })
    }

    if (redirectTo) return redirect(redirectTo)
    if (file.folder)
      return redirect(
        '/projects/' + file.folder.projectId + '/folder/' + file.folderId
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
