import contentDisposition from 'content-disposition'
import { Route } from './+types/$projectId.$folderId.$fileKey'
import { FileService } from 'app/server/services/file.server'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { projectId, folderId, fileKey } = params
  const path = [projectId, folderId, fileKey].join('/')
  const headers = new Headers()
  const { file, metadata, readable } = await FileService.streamFile(path)

  headers.append(
    'Content-Disposition',
    contentDisposition(file.name || file.id, { type: 'inline' })
  )
  headers.append('Content-Length', metadata.contentLength.toString())
  headers.append(
    'Content-Type',
    metadata.contentType || 'application/octet-stream'
  )
  headers.append('Cache-Control', 'public, max-age=31536000, immutable')
  headers.append('Etag', metadata.etag)

  return new Response(readable, { headers })
}
