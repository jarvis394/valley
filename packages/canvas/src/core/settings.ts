import { z } from 'zod'

/**
 * Publishing and access settings. They live beside the document, never in it, because the
 * document is what a published page ships to every viewer.
 */
export const projectSettingsSchema = z.object({
  /** Public URL path segment. */
  slug: z.string().optional(),
  storeUntil: z.enum(['week', 'month', 'year', 'forever']).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  usePassword: z.boolean().optional(),
  password: z.string().optional(),
})
export type ProjectSettings = z.infer<typeof projectSettingsSchema>
