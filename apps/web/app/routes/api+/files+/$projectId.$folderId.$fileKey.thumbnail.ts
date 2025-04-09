import { getImgResponse } from 'openimg/node'
import { cors } from 'remix-utils/cors'
import { Route } from './+types/$projectId.$folderId.$fileKey'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { projectId, folderId, fileKey } = params
  const path = [projectId, folderId, fileKey].join('/')

  const allowedOrigins = new Set([
    process.env.WEB_SERVICE_URL,
    process.env.GALLERY_SERVICE_URL,
  ])
  const allowedOriginsArray: string[] = []
  for (const url of allowedOrigins) {
    url && allowedOriginsArray.push(url)
  }

  try {
    const response = await getImgResponse(request, {
      allowlistedOrigins: allowedOriginsArray,
      cacheFolder: process.env.VERCEL === '1' ? 'no_cache' : undefined,
      getImgSource: () => {
        return {
          url: process.env.WEB_SERVICE_URL + '/api/files/' + path,
          type: 'fetch',
        }
      },
    })

    return await cors(request, response, {
      origin: allowedOriginsArray,
    })
  } catch (e) {
    throw new Response((e as Error).message, {
      status: 500,
    })
  }
}
