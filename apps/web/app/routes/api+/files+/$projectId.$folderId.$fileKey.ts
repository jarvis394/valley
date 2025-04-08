import { data } from 'react-router'
import { db, files, folders, projects, eq } from '@valley/db'
import { getImgResponse } from 'openimg/node'
import { cors } from 'remix-utils/cors'
import { invariantResponse } from 'app/utils/invariant'
import { Route } from './+types/$projectId.$folderId.$fileKey'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { projectId, folderId, fileKey } = params
  const headers = new Headers()

  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  // TODO: fixme
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin')

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

  const allowedOrigins = new Set([
    process.env.WEB_SERVICE_URL,
    process.env.UPLOAD_SERVICE_URL,
    process.env.GALLERY_SERVICE_URL,
  ])
  const allowedOriginsArray: string[] = []
  for (const url of allowedOrigins) {
    url && allowedOriginsArray.push(url)
  }

  const response = await getImgResponse(request, {
    headers,
    allowlistedOrigins: allowedOriginsArray,
    cacheFolder: process.env.VERCEL === '1' ? 'no_cache' : undefined,
    getImgSource: () => {
      return {
        url: process.env.UPLOAD_SERVICE_URL + '/api/files/' + path,
        type: 'fetch',
      }
    },
  })

  return await cors(request, response, {
    origin: allowedOriginsArray,
  })
}
