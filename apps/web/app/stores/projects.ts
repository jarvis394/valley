import type { File, Project, Folder } from '@valley/db'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type FolderWithFiles = Omit<Folder, 'files' | 'id' | 'projectId'> & {
  id: Folder['id']
  projectId: Project['id']
  files?: File[]
}

type ProjectWithFoldersMap = Omit<Project, 'folders' | 'id'> & {
  id: Project['id']
  folders: Record<Folder['id'], FolderWithFiles>
}

export type ProjectsState = {
  projects: Record<Project['id'], ProjectWithFoldersMap>
}

export type ProjectsAction = {
  setProject: (project: ProjectWithFoldersMap) => void
  setFolder: (folder: FolderWithFiles) => void
  setFiles: (props: {
    projectId: Project['id']
    folderId: Folder['id']
    files: File[]
  }) => void
  addFile: (props: {
    projectId: Project['id']
    folderId: Folder['id']
    file: File
  }) => void
}

// We add partial project to the store as we do not use
// the full project object in app, therefore we can cast type
const makeDefaultProject = (id: Project['id']): ProjectWithFoldersMap =>
  ({
    id,
    folders: {},
    totalFiles: 0,
    totalSize: '0',
  }) as ProjectWithFoldersMap

const makeDefaultFolder = (
  id: Folder['id'],
  projectId: Project['id']
): FolderWithFiles => ({
  id,
  projectId,
  totalSize: '0',
  totalFiles: 0,
  files: [],
  dateCreated: new Date(),
  dateUpdated: new Date(),
  description: null,
  isDefaultFolder: false,
  title: 'Default',
})

export const useProjectsStore = create<ProjectsState & ProjectsAction>()(
  immer((set) => ({
    projects: {},
    setProject: (project) =>
      set((state) => {
        for (const id in project.folders) {
          const stateFiles =
            state.projects[project.id]?.folders?.[id]?.files ||
            project.folders['id']?.files ||
            []
          project.folders[id].files = stateFiles
        }

        state.projects[project.id] = project
      }),
    setFolder: (folder) => {
      set((state) => {
        if (!state.projects[folder.projectId]) {
          state.projects[folder.projectId] = makeDefaultProject(
            folder.projectId
          )
        }

        state.projects[folder.projectId].folders[folder.id] = folder
      })
    },
    setFiles: ({ projectId, folderId, files }) => {
      set((state) => {
        if (!state.projects[projectId]) {
          state.projects[projectId] = makeDefaultProject(projectId)
        }

        if (!state.projects[projectId].folders[folderId]) {
          state.projects[projectId].folders[folderId] = makeDefaultFolder(
            folderId,
            projectId
          )
        }

        state.projects[projectId].folders[folderId].files = files
      })
    },
    addFile: ({ projectId, folderId, file }) => {
      set((state) => {
        if (!state.projects[projectId]) {
          state.projects[projectId] = makeDefaultProject(projectId)
        }

        if (!state.projects[projectId].folders[folderId]) {
          state.projects[projectId].folders[folderId] = makeDefaultFolder(
            folderId,
            projectId
          )
        }

        const projectTotalSize = Number(state.projects[projectId].totalSize)
        const folderTotalSize = Number(
          state.projects[projectId].folders[folderId].totalSize
        )
        const fileSize = Number(file.size)
        state.projects[projectId].totalFiles += 1
        state.projects[projectId].totalSize = (
          projectTotalSize + fileSize
        ).toString()
        state.projects[projectId].folders[folderId].totalFiles += 1
        state.projects[projectId].folders[folderId].totalSize = (
          folderTotalSize + fileSize
        ).toString()
        state.projects[projectId].folders[folderId].files?.push(file)
      })
    },
  }))
)
