import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'staging', 'test'] as const),
  DATABASE_DRIVER: z.enum(['neon', 'postgres']),
  SESSION_SECRET: z.string(),
  RESEND_API_KEY: z.string().optional().default('MOCK_'),

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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}
