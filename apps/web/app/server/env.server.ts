import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'staging', 'test'] as const),
  API_URL: z.string(),
  TUSD_URL: z.string(),
  SESSION_SECRET: z.string(),
  MAGIC_LINK_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  GITHUB_TOKEN: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  INTERNAL_COMMAND_TOKEN: z.string(),
  WEB_PORT: z.string(),
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
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * WARNING: Do **not** add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
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
