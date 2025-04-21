import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'staging', 'test'] as const),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),
  TUSD_URL: z.string(),
  SESSION_SECRET: z.string(),
  GALLERY_PORT: z.string(),
  HOST: z.string().optional(),
})

export function init() {
  const parsed = schema.safeParse(process.env)

  if (parsed.success === false) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors
    )

    throw new Error('Invalid environment variables')
  }
}

/**
 * WARNING: Do **not** add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    TUSD_URL: process.env.TUSD_URL,
  }
}

type ENV = ReturnType<typeof getEnv>

declare global {
  export const ENV: ENV
  interface Window {
    ENV: ENV
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}
