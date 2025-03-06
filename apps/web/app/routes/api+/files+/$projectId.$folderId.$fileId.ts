import { LoaderFunctionArgs } from '@remix-run/node'
import { getDomainUrl } from 'app/utils/misc'
import { getImgResponse } from 'openimg/node'
import { cors } from 'remix-utils/cors'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { projectId, folderId, fileId } = params
  const headers = new Headers()

  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

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
