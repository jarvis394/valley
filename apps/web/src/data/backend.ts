import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  approveAdminUser,
  changeAdminUserRole,
  loadAdminUsers,
  loadAuthConfig,
  loadPendingUsersCount,
  loadProfileSettings,
  loadSessionState,
  removeAdminUser,
  saveProfileName,
} from '../server/auth.server'
import {
  loadAccount,
  loadProject,
  loadProjects,
  removeProject,
  startProject,
  storeProject,
} from '../server/projects.server'

export const getAuthConfig = createServerFn().handler(() => loadAuthConfig())

export const getSessionState = createServerFn().handler(() => loadSessionState())

export const getProfileSettings = createServerFn().handler(() => loadProfileSettings())

export const updateProfileName = createServerFn({ method: 'POST' })
  .validator(z.string().trim().min(1).max(64))
  .handler(({ data }) => saveProfileName(data))

export const listAdminUsers = createServerFn().handler(() => loadAdminUsers())

export const getPendingUsersCount = createServerFn().handler(() => loadPendingUsersCount())

export const approveUser = createServerFn({ method: 'POST' })
  .validator(z.string().min(1))
  .handler(({ data }) => approveAdminUser(data))

export const setUserRole = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().min(1), role: z.enum(['user', 'admin']) }))
  .handler(({ data }) => changeAdminUserRole(data.id, data.role))

export const deleteAdminUser = createServerFn({ method: 'POST' })
  .validator(z.string().min(1))
  .handler(({ data }) => removeAdminUser(data))

export const getAccount = createServerFn().handler(() => loadAccount())

export const listProjects = createServerFn().handler(() => loadProjects())

export const getProject = createServerFn()
  .validator(z.string().min(1))
  .handler(({ data }) => loadProject(data))

export const createProject = createServerFn({ method: 'POST' })
  .validator(z.object({ title: z.string().min(1), date: z.iso.date() }))
  .handler(({ data }) => startProject(data))

export const deleteProject = createServerFn({ method: 'POST' })
  .validator(z.string().min(1))
  .handler(({ data }) => removeProject(data))

export const saveProject = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string().min(1), doc: z.unknown(), settings: z.unknown() }))
  .handler(({ data }) => storeProject(data))
