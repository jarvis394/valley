import type { UserRole } from '@valley/db'
import type { SignupMode } from '../env'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const isApproved = (user: { role?: string | null; approvedAt?: Date | string | null }) =>
  user.role === 'admin' || Boolean(user.approvedAt)

/** `open` mode approves sign-ups immediately; `invite` queues them for an admin. */
export const resolveNewUserAccess = (
  signupMode: SignupMode,
): { role: UserRole; approvedAt: Date | null } => ({
  role: 'user',
  approvedAt: signupMode === 'open' ? new Date() : null,
})
