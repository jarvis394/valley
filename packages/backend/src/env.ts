import { existsSync } from 'node:fs'
import { z } from 'zod'

export const SIGNUP_MODES = ['invite', 'open'] as const
export type SignupMode = (typeof SIGNUP_MODES)[number]

const DEV_FALLBACK_SECRET = 'INSECURE_UPDATE_ME_IMMEDIATELY_DEV_ONLY'

let warnedDevSecret = false

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is not set'),
  MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(2 * 1024 ** 3),
})

export type BackendEnv = z.infer<typeof envSchema>

export const readEnv = (env: Record<string, string | undefined> = process.env) =>
  envSchema.parse(env)

const authEnvSchema = z.object({
  PUBLIC_URL: z
    .url()
    .default('http://localhost:3000')
    .transform((url) => url.replace(/\/+$/, '')),
  BETTER_AUTH_SECRET: z.string().optional(),
  VALLEY_SIGNUP_MODE: z.enum(SIGNUP_MODES).default('invite'),
  RESEND_API_KEY: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined),
  MAIL_FROM: z.string().trim().min(1).default('Valley <noreply@valley.invalid>'),
})

export interface AuthEnv {
  PUBLIC_URL: string
  BETTER_AUTH_SECRET: string
  VALLEY_SIGNUP_MODE: SignupMode
  RESEND_API_KEY?: string
  MAIL_FROM: string
}

export function readAuthEnv(env: Record<string, string | undefined> = process.env): AuthEnv {
  const parsed = authEnvSchema.parse(env)
  const rawSecret = parsed.BETTER_AUTH_SECRET?.trim()

  if (env.NODE_ENV === 'production') {
    const secret = z
      .string()
      .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters in production')
      .refine(
        (value) => value !== DEV_FALLBACK_SECRET,
        'BETTER_AUTH_SECRET must be changed from the development placeholder in production',
      )
      .parse(rawSecret)

    return { ...parsed, BETTER_AUTH_SECRET: secret }
  }

  if (!rawSecret || rawSecret.length < 32) {
    if (!warnedDevSecret) {
      warnedDevSecret = true
      console.warn(
        'BETTER_AUTH_SECRET is unset or shorter than 32 characters; using a development fallback secret',
      )
    }

    return { ...parsed, BETTER_AUTH_SECRET: DEV_FALLBACK_SECRET }
  }

  return { ...parsed, BETTER_AUTH_SECRET: rawSecret }
}

/** Loads the `.env` files a script runs with. Earlier files and variables already set win. */
export function loadEnvFiles(files: string[]) {
  for (const file of files) {
    if (existsSync(file)) process.loadEnvFile(file)
  }
}
