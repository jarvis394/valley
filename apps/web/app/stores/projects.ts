import type { File } from '@valley/db'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ProjectsState = {
  files: File[] | null
}

export type ProjectsAction = {
  setFiles: (files: ProjectsState['files']) => void
  addFile: (file: File) => void
}

export const useProjectsStore = create<ProjectsState & ProjectsAction>()(
  immer((set) => ({
    files: null,
    setFiles: (files) =>
      set((state) => {
        state.files = files
      }),
    addFile: (file) =>
      set((state) => {
        state.files = [...(state.files || []), file]
      }),
  }))
)
