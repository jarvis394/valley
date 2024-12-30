import { useRouteLoaderData } from '@remix-run/react'
import { loader as folderLoader } from 'app/routes/_user+/projects_.$projectId+/folder.$folderId'

export function useFolderAwait() {
  const folderData = useRouteLoaderData<typeof folderLoader>(
    'routes/_user+/projects_.$projectId+/folder.$folderId'
  )

  return folderData || null
}
