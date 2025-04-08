import { type Project, Cover } from '@valley/db'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type CoversState = {
  covers: Record<Cover['projectId'], Pick<Cover, 'x' | 'y'>>
}

export type CoversAction = {
  setProjectCoverPosition: (
    projectId: Project['id'],
    position: Pick<Cover, 'x' | 'y'>
  ) => void
}

export const useCoversStore = create<CoversState & CoversAction>()(
  immer((set) => ({
    covers: {},
    setProjectCoverPosition: (projectId, position) =>
      set((state) => {
        state.covers[projectId] = position
      }),
  }))
)
