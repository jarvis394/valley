import type { File, Project, Folder, Cover } from '@valley/db'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type FileWithCover = File & { Cover?: Cover[] | null }

type FolderWithFiles = Omit<Folder, 'files' | 'id' | 'projectId'> & {
  id: Folder['id']
  projectId: Project['id']
  files?: FileWithCover[]
}

type ProjectWithFoldersMap = Omit<Project, 'folders' | 'id'> & {
  id: Project['id']
  folders: Record<Folder['id'], FolderWithFiles>
  coverImage?: (Cover & { File: File }) | null
}

export type ProjectsState = {
  projects: Record<Project['id'], ProjectWithFoldersMap>
}

export type ProjectsAction = {
  deleteProject: (id: string) => void
  setProject: (project: ProjectWithFoldersMap) => void
  setProjectFolders: (
    projectId: Project['id'],
    folders: FolderWithFiles[]
  ) => void
  setFolder: (folder: FolderWithFiles) => void
  setFiles: (props: {
    projectId: Project['id']
    folderId: Folder['id']
    files: FileWithCover[]
  }) => void
  addFile: (props: {
    projectId: Project['id']
    folderId: Folder['id']
    file: FileWithCover
  }) => void
}

const makeDefaultProject = (id: Project['id']): ProjectWithFoldersMap => ({
  id,
  folders: {},
  totalFiles: 0,
  totalSize: '0',
  dateCreated: new Date(),
  dateShot: new Date(),
  dateUpdated: new Date(),
  language: 'ru',
  password: null,
  protected: false,
  storedUntil: null,
  title: '',
  translationStringsId: null,
  url: '',
  userId: '',
})

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
    deleteProject: (id) =>
      set((state) => {
        delete state.projects[id]
      }),
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
    setProjectFolders: (projectId, folders) => {
      set((state) => {
        if (!state.projects[projectId]) {
          state.projects[projectId] = makeDefaultProject(projectId)
        }

        const foldersMap: ProjectWithFoldersMap['folders'] = {}
        folders.forEach((folder) => {
          foldersMap[folder.id] = folder
        })
        state.projects[projectId].folders = foldersMap
      })
    },
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
