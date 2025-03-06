import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'staging', 'test'] as const),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  TUSD_URL: z.string(),
  UPLOAD_SERVICE_URL: z.string(),
  GALLERY_SERVICE_URL: z.string(),
  SESSION_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  WEB_PORT: z.string(),
  HOST: z.string().optional(),

  // GitHub OAuth
  GITHUB_TOKEN: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().default('MOCK_GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: z.string().default('MOCK_GOOGLE_CLIENT_SECRET'),

  // VK OAuth
  VK_CLIENT_ID: z.string().default('MOCK_VK_CLIENT_ID'),
  VK_CLIENT_SECRET: z.string().default('MOCK_VK_CLIENT_SECRET'),
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
    UPLOAD_SERVICE_URL: process.env.UPLOAD_SERVICE_URL,
    GALLERY_SERVICE_URL: process.env.GALLERY_SERVICE_URL,
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
