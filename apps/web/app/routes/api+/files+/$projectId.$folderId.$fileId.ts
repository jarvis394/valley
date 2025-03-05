import { LoaderFunctionArgs } from '@remix-run/node'
import { getDomainUrl } from 'app/utils/misc'
import { getImgResponse } from 'openimg/node'
import { promises as fs, constants } from 'node:fs'

let cacheDir: string | null = null

async function getCacheDir() {
  if (cacheDir) return cacheDir

  let dir = './tests/fixtures/openimg'
  if (process.env.NODE_ENV === 'production') {
    const isAccessible = await fs
      .access('/data', constants.W_OK)
      .then(() => true)
      .catch(() => false)

    if (isAccessible) {
      dir = '/data/images'
    }
  }

  return (cacheDir = dir)
}

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
    cacheFolder: await getCacheDir(),
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
