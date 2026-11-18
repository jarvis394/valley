import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { loadGallery, loadHome } from '../server/gallery.server'

export const getHome = createServerFn().handler(() => loadHome())

export const getGallery = createServerFn()
  .validator(z.string().min(1))
  .handler(({ data }) => loadGallery(data))

export type Home = NonNullable<Awaited<ReturnType<typeof getHome>>>
export type Gallery = NonNullable<Awaited<ReturnType<typeof getGallery>>>
