import { Route } from './+types/$projectId.$folderId.$fileKey'
import { FileService } from 'app/server/services/file.server'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { projectId, folderId, fileKey } = params
  const path = [projectId, folderId, fileKey].join('/')
  return await FileService.streamFile(path)
}
