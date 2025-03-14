import { data, LoaderFunctionArgs } from '@remix-run/node'
import { db, files, folders, projects } from '@valley/db'
import { getDomainUrl } from 'app/utils/misc'
import { getImgResponse } from 'openimg/node'
import { cors } from 'remix-utils/cors'
import { eq } from 'drizzle-orm'
import { invariantResponse } from 'app/utils/invariant'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { projectId, folderId, fileId } = params
  const headers = new Headers()

  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  invariantResponse(projectId, 'No project ID found in params')
  invariantResponse(folderId, 'No folder ID found in params')
  invariantResponse(fileId, 'No file ID found in params')

  const [result] = await db
    .select()
    .from(files)
    .leftJoin(folders, eq(folders.id, folderId))
    .leftJoin(projects, eq(projects.id, projectId))
    .where(eq(files.id, fileId))

  if (!result.files || result.files.deletedAt) {
    return data('File not found', { status: 404 })
  }

  if (result.projects?.protected) {
    return data('File not found', { status: 404 })
  }

  const response = await getImgResponse(request, {
    headers,
    allowlistedOrigins: [
      getDomainUrl(request),
      process.env.UPLOAD_SERVICE_URL,
      process.env.GALLERY_SERVICE_URL,
    ].filter(Boolean),
    cacheFolder: process.env.VERCEL === '1' ? 'no_cache' : undefined,
    getImgSource: () => {
      return {
        url:
          process.env.UPLOAD_SERVICE_URL +
          '/api/files/' +
          [projectId, folderId, fileId].join('/'),
        type: 'fetch',
      }
    },
  })

  return await cors(request, response, {
    origin: [
      getDomainUrl(request),
      process.env.UPLOAD_SERVICE_URL,
      process.env.GALLERY_SERVICE_URL,
    ].filter(Boolean),
  })
}
