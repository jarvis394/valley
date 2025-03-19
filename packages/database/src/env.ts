import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'staging', 'test'] as const),
  DATABASE_URL: z.string(),
  DATABASE_DRIVER: z.enum(['neon', 'postgres']),
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
