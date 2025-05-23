import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'staging', 'test'] as const),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),
  WEB_SERVICE_URL: z.string(),
  GALLERY_SERVICE_URL: z.string(),
  SESSION_SECRET: z.string(),
  RESEND_API_KEY: z.string().optional().default('MOCK_'),
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

  DRIVE_DISK: z.enum(['fs', 's3', 'gcs']).default('fs'),

  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_ENDPOINT: z.string().optional(),
  AWS_BUCKET: z.string().optional(),

  GCS_KEY_FILENAME: z.string().optional(),
  GCS_BUCKET: z.string().optional(),
  GCS_PROJECT_ID: z.string().optional(),
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
    GALLERY_SERVICE_URL: process.env.GALLERY_SERVICE_URL,
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
