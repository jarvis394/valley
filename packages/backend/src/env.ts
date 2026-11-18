import { existsSync } from 'node:fs'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is not set'),
  /** Name of the account created on first start. */
  VALLEY_OWNER_NAME: z.string().min(1).default('Valley'),
  MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(2 * 1024 ** 3),
})

export type BackendEnv = z.infer<typeof envSchema>

export const readEnv = (env: Record<string, string | undefined> = process.env) =>
  envSchema.parse(env)

/** Loads the `.env` files a script runs with. Earlier files and variables already set win. */
export function loadEnvFiles(files: string[]) {
  for (const file of files) {
    if (existsSync(file)) process.loadEnvFile(file)
  }
}
