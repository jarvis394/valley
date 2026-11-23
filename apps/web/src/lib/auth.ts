import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  basePath: '/api/auth',
})

const AUTH_ERRORS: Record<string, string> = {
  email_link_invalid: 'That email link has expired or was already used. Send a new one.',
  email_in_use: 'Another Valley account took that email first. Try a different one.',
  INVALID_TOKEN: 'That confirmation link is invalid or expired. Sign in to get a new one.',
  TOKEN_EXPIRED: 'That confirmation link has expired. Sign in to get a new one.',
}

export const describeAuthError = (code: string | undefined) =>
  code ? (AUTH_ERRORS[code] ?? 'Something went wrong. Please try again.') : null

export const safeRedirect = (target?: string) =>
  target && target.startsWith('/') && !target.startsWith('//') ? target : '/projects'
