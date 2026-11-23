import type { UserRole } from '@valley/db'
import type { SignupMode } from '../env'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const isApproved = (user: { role?: string | null; approvedAt?: Date | string | null }) =>
  user.role === 'admin' || Boolean(user.approvedAt)

/**
 * The first user bootstraps the instance as an approved admin. Later sign-ups follow
 * `VALLEY_SIGNUP_MODE`: approved immediately in `open` mode, or queued for approval in `invite`.
 */
export function resolveNewUserAccess({
  hasExistingUsers,
  signupMode,
}: {
  hasExistingUsers: boolean
  signupMode: SignupMode
}): { role: UserRole; approvedAt: Date | null } {
  if (!hasExistingUsers) return { role: 'admin', approvedAt: new Date() }
  if (signupMode === 'open') return { role: 'user', approvedAt: new Date() }

  return { role: 'user', approvedAt: null }
}
