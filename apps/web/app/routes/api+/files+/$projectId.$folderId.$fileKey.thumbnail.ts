import { getImgResponse } from 'openimg/node'
import { cors } from 'remix-utils/cors'
import { Route } from './+types/$projectId.$folderId.$fileKey'
import { FileService } from 'app/server/services/file.server'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { projectId, folderId, fileKey } = params
  const path = [projectId, folderId, fileKey].join('/')
  const headers = new Headers()
  const allowedOrigins = new Set([
    process.env.WEB_SERVICE_URL,
    process.env.GALLERY_SERVICE_URL,
  ])
  const allowedOriginsArray: string[] = []
  for (const url of allowedOrigins) {
    url && allowedOriginsArray.push(url)
  }

  headers.append('Cache-Control', 'public, max-age=31536000, immutable')
  headers.append('cross-origin-resource-policy', 'same-site')

  try {
    const { readable } = await FileService.streamFile(path)
    const response = await getImgResponse(request, {
      headers,
      allowlistedOrigins: allowedOriginsArray,
      cacheFolder: process.env.VERCEL === '1' ? 'no_cache' : undefined,
      getImgSource: () => {
        return {
          cacheKey: path,
          data: readable,
          type: 'data',
        }
      },
    })

    return await cors(request, response, {
      origin: allowedOriginsArray,
    })
  } catch (e) {
    return e
  }
}
