import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { redirectToKey } from 'app/routes/auth+/verify+'
import { requireUser } from 'app/server/auth/auth.server'
import { prisma } from 'app/server/db.server'
import { invariantResponse } from 'app/utils/invariant'

export const loader = () => redirect('/projects')

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireUser(request)
  const { id } = params
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get(redirectToKey)

  try {
    const folder = await prisma.folder.findFirst({
      where: { id, Project: { userId: user.id } },
      select: {
        projectId: true,
        totalFiles: true,
        totalSize: true,
        Project: { select: { totalFiles: true, totalSize: true } },
        id: true,
        isDefaultFolder: true,
      },
    })

    invariantResponse(folder, 'Folder not found', { status: 404 })
    invariantResponse(!folder.isDefaultFolder, 'Cannot delete default folder', {
      status: 403,
    })

    await prisma.$transaction(async (tx) => {
      const newTotalFiles = folder.Project.totalFiles - folder.totalFiles
      const newTotalSize =
        Number(folder.Project.totalSize) - Number(folder.totalSize)

      await tx.file.updateMany({
        where: { folderId: folder.id },
        data: { isPendingDeletion: true, folderId: null },
      })
      await tx.folder.delete({ where: { id: folder.id } })
      await tx.project.update({
        where: {
          id: folder.projectId,
        },
        data: {
          totalFiles: newTotalFiles,
          totalSize: newTotalSize.toString(),
        },
      })
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
