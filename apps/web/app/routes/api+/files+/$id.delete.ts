import { LoaderFunctionArgs, redirect } from '@remix-run/cloudflare'
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
    const file = await prisma.file.findFirst({
      where: {
        id,
        // Is not deleted
        isPendingDeletion: false,
        // Belongs to user
        Folder: { Project: { userId: user.id } },
      },
      include: {
        Folder: {
          include: {
            Project: true,
          },
        },
      },
    })

    invariantResponse(file, 'File not found', { status: 404 })

    if (file.Folder) {
      await prisma.$transaction(async (tx) => {
        if (!file.Folder || !file.folderId) return

        const newFolderTotalFiles = file.Folder.totalFiles - 1
        const newFolderTotalSize =
          Number(file.Folder.totalSize) - Number(file.size)
        const newProjectTotalFiles = file.Folder.Project.totalFiles - 1
        const newProjectTotalSize =
          Number(file.Folder.Project.totalSize) - Number(file.size)

        await tx.file.update({
          where: { id: file.id },
          data: { isPendingDeletion: true, folderId: null },
        })
        await tx.folder.update({
          where: {
            id: file.folderId,
          },
          data: {
            totalFiles: newFolderTotalFiles,
            totalSize: newFolderTotalSize.toString(),
          },
        })
        await tx.project.update({
          where: {
            id: file.Folder.projectId,
          },
          data: {
            totalFiles: newProjectTotalFiles,
            totalSize: newProjectTotalSize.toString(),
          },
        })
      })
    }

    return redirect(
      redirectTo ||
        '/projects/' + file.Folder?.projectId + '/folder/' + file.folderId
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
