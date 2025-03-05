import { LoaderFunctionArgs } from '@remix-run/node'
import { getDomainUrl } from 'app/utils/misc'
import { getImgResponse } from 'openimg/node'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { projectId, folderId, fileId } = params
  const headers = new Headers()

  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return getImgResponse(request, {
    headers,
    allowlistedOrigins: [
      getDomainUrl(request),
      process.env.UPLOAD_SERVICE_URL,
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
}
