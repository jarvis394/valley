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
      select: { projectId: true, id: true, isDefaultFolder: true },
    })

    invariantResponse(folder, 'Folder not found', { status: 404 })
    invariantResponse(folder.isDefaultFolder, 'Cannot delete default folder', {
      status: 403,
    })

    await prisma.$transaction(async (tx) => {
      await tx.file.updateMany({
        where: { folderId: folder.id },
        data: { isPendingDeletion: true, folderId: null },
      })
      await tx.folder.delete({ where: { id: folder.id } })
    })

    return redirect(
      redirectTo || '/projects/' + folder.projectId + '/folder/' + folder.id
    )
  } catch (e) {
    console.error(e)
    throw new Response('Unknown error occurred', {
      status: 500,
    })
  }
}
