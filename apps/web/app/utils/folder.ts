import { useParams, useRouteLoaderData } from '@remix-run/react'
import { loader as folderLoader } from 'app/routes/_user+/projects_.$projectId+/folder.$folderId'
import { useProject } from './project'
import { FolderWithFiles } from '@valley/shared'

export function useFolderAwait() {
  const folderData = useRouteLoaderData<typeof folderLoader>(
    'routes/_user+/projects_.$projectId+/folder.$folderId'
  )

  return folderData || null
}

export function useFolder() {
  const { folderId } = useParams()
  const folder = useFolderAwait()
  const project = useProject()
  const storeFolder = folderId
    ? project.folders.find((e) => e.id === folderId)
    : null

  if (storeFolder && 'files' in storeFolder) {
    return storeFolder as FolderWithFiles
  }

  return folder?.folder || null
}
