import {
  approveUser,
  BackendError,
  completeSetup,
  countPendingUsers,
  declineUser,
  deleteAdminUser,
  getDb,
  getMailer,
  getSignupMode,
  getStorage,
  hasCredentialAccount,
  isApproved,
  isSetupComplete,
  listUsers,
  readAuthEnv,
  refKey,
  resolveRef,
  setUserRole,
  setupToken,
  type SetupInput,
  updateProfileName,
} from '@valley/backend'
import type { UserRole } from '@valley/db'
import type { AdminUser, AuthConfig, ProfileSettings, SessionState } from '../data/types'
import { getSession, mediaUrl, requireAccount, requireAdmin } from './backend.server'

export function loadAuthConfig(): AuthConfig {
  return { signupMode: getSignupMode() }
}

const setupOptions = () => {
  const env = readAuthEnv()

  return { preset: env.VALLEY_SETUP_TOKEN, publicUrl: env.PUBLIC_URL }
}

/** Whether `/setup` still has to run. Prints the setup link to the log the first time it does. */
export async function loadSetupRequired() {
  if (await isSetupComplete(getDb())) return false

  setupToken(setupOptions())

  return true
}

export async function finishSetup(input: SetupInput) {
  await completeSetup(getDb(), setupOptions(), input)

  return { ok: true }
}

export async function loadSessionState(): Promise<SessionState> {
  const session = await getSession()
  if (!session) return { status: 'signed-out' }

  const avatar = resolveRef(session.user.image, mediaUrl) ?? null
  if (!isApproved(session.user)) {
    return {
      status: 'pending',
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatar,
      },
    }
  }

  const role: UserRole = session.user.role === 'admin' ? 'admin' : 'user'

  return {
    status: 'active',
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      avatar,
      role,
      isAdmin: role === 'admin',
    },
  }
}

export async function loadProfileSettings(): Promise<ProfileSettings> {
  const { user } = await requireAccount()
  const hasPassword = await hasCredentialAccount(getDb(), user.id)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: resolveRef(user.image, mediaUrl) ?? null,
    hasUploadedAvatar: Boolean(refKey(user.image)),
    hasPassword,
    isAdmin: user.role === 'admin',
  }
}

export async function saveProfileName(name: string) {
  const { accountId } = await requireAccount()

  return updateProfileName(getDb(), accountId, name)
}

export async function loadAdminUsers(): Promise<AdminUser[]> {
  await requireAdmin()
  const rows = await listUsers(getDb(), mediaUrl)

  return rows.map((row) => ({
    ...row,
    approvedAt: row.approvedAt ? row.approvedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  }))
}

export async function loadPendingUsersCount() {
  await requireAdmin()

  return countPendingUsers(getDb())
}

export async function approveAdminUser(id: string) {
  await requireAdmin()
  const result = await approveUser(
    { db: getDb(), mailer: getMailer(), publicUrl: readAuthEnv().PUBLIC_URL },
    id,
  )
  if (result === 'not_found') throw new BackendError('not-found', 'User not found')

  return { ok: true }
}

export async function changeAdminUserRole(id: string, role: UserRole) {
  const { accountId } = await requireAdmin()

  return setUserRole(getDb(), accountId, id, role)
}

export async function declineAdminUser(id: string) {
  await requireAdmin()

  return declineUser(getDb(), getStorage(), id)
}

export async function removeAdminUser(id: string) {
  const { accountId } = await requireAdmin()

  return deleteAdminUser(getDb(), getStorage(), accountId, id)
}
