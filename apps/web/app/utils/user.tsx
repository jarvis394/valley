import { useRouteLoaderData } from 'react-router'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { User } from '@valley/db'
import { Route } from '../routes/_user+/+types/_layout'

type UserState = {
  data: User | null
}
type UserActions = {
  setUser: (data: UserState['data']) => void
}

export const useUserStore = create<UserState & UserActions>()(
  immer((set) => ({
    data: null,
    setUser: (data) =>
      set((state) => {
        state.data = data
      }),
  }))
)

export function useUserAwait() {
  const data = useRouteLoaderData<Route.ComponentProps['loaderData']>(
    'routes/_user+/_layout'
  )

  return data?.user
}

type Action = 'create' | 'read' | 'update' | 'delete'
type Entity = 'user' | 'note'
type Access = 'own' | 'any' | 'own,any' | 'any,own'
export type PermissionString =
  | `${Action}:${Entity}`
  | `${Action}:${Entity}:${Access}`

export function parsePermissionString(permissionString: PermissionString) {
  const [action, entity, access] = permissionString.split(':') as [
    Action,
    Entity,
    Access | undefined,
  ]
  return {
    action,
    entity,
    access: access ? (access.split(',') as Access[]) : undefined,
  }
}
