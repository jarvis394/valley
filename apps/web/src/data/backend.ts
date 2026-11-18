import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  loadAccount,
  loadProject,
  loadProjects,
  removeProject,
  startProject,
  storeProject,
} from '../server/projects.server'

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
