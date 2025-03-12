import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { redirectToKey } from 'app/config/paramsKeys'
import { requireUser } from 'app/server/auth/auth.server'
import { invariantResponse } from 'app/utils/invariant'
import { db, files, folders, projects } from '@valley/db'
import { sql, eq } from 'drizzle-orm'

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

  invariantResponse(id, 'No folder ID found in params')

  try {
    const folder = await db.query.folders.findFirst({
      where: (fields, { eq, and }) => and(eq(fields.id, id), isUsersProject),
      columns: {
        projectId: true,
        totalFiles: true,
        totalSize: true,
        id: true,
        isDefaultFolder: true,
      },
      with: {
        project: {
          columns: {
            totalFiles: true,
            totalSize: true,
          },
        },
      },
    })

    invariantResponse(folder, 'Folder not found', { status: 404 })
    invariantResponse(!folder.isDefaultFolder, 'Cannot delete default folder', {
      status: 403,
    })

    await db.transaction(async (tx) => {
      const newTotalFiles = folder.project.totalFiles - folder.totalFiles
      const newTotalSize =
        Number(folder.project.totalSize) - Number(folder.totalSize)

      await tx
        .update(files)
        .set({ deletedAt: new Date(), folderId: null })
        .where(eq(files.folderId, folder.id))
      await tx.delete(folders).where(eq(folders.id, folder.id))
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
