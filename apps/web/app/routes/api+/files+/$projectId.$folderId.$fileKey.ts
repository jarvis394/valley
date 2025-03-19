import { data, LoaderFunctionArgs } from '@remix-run/node'
import { db, files, folders, projects } from '@valley/db'
import { getDomainUrl } from 'app/utils/misc'
import { getImgResponse } from 'openimg/node'
import { cors } from 'remix-utils/cors'
import { eq } from 'drizzle-orm'
import { invariantResponse } from 'app/utils/invariant'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { projectId, folderId, fileKey } = params
  const headers = new Headers()

  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  invariantResponse(projectId, 'No project ID found in params')
  invariantResponse(folderId, 'No folder ID found in params')
  invariantResponse(fileKey, 'No file key found in params')

  const path = [projectId, folderId, fileKey].join('/')
  const [result] = await db
    .select()
    .from(files)
    .where(eq(files.path, path))
    .leftJoin(folders, eq(folders.id, files.folderId))
    .leftJoin(projects, eq(projects.id, folders.projectId))

  if (!result?.files || result?.files.deletedAt) {
    return data('File not found', { status: 404 })
  }

  // TODO: implement protected projects
  // if (result.projects?.protected) {
  //   return data('File not found', { status: 404 })
  // }

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
        url: process.env.UPLOAD_SERVICE_URL + '/api/files/' + path,
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
