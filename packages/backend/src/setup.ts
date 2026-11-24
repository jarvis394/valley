import { randomBytes, timingSafeEqual } from 'node:crypto'
import { account, and, eq, sql, user, type Db } from '@valley/db'
import { hashPassword } from 'better-auth/crypto'
import { nanoid } from 'nanoid'
import { BackendError } from './errors'

const SETUP_LOCK = 0x76616c6c

export interface SetupInput {
  token: string
  name: string
  email: string
  password: string
}

interface SetupState {
  complete?: boolean
  token?: string
}

// On globalThis so dev-server module reloads keep the token already printed to the log.
const state: SetupState = ((globalThis as { valleySetup?: SetupState }).valleySetup ??= {})

/** An instance is set up once an admin can sign in with a password. */
export async function isSetupComplete(db: Db) {
  if (state.complete) return true

  const [admin] = await db
    .select({ id: user.id })
    .from(user)
    .innerJoin(account, and(eq(account.userId, user.id), eq(account.providerId, 'credential')))
    .where(eq(user.role, 'admin'))
    .limit(1)
  state.complete = Boolean(admin)

  return state.complete
}

/** The one-time token that unlocks `/setup`, printed to the server log the first time it's made. */
export function setupToken({ preset, publicUrl }: { preset?: string; publicUrl: string }) {
  if (state.token) return state.token

  state.token = preset ?? randomBytes(24).toString('base64url')
  console.info(
    `Valley is not set up yet. Open this link to create the admin account:\n${publicUrl}/setup?token=${state.token}`,
  )

  return state.token
}

const matches = (given: string, expected: string) => {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)

  return a.length === b.length && timingSafeEqual(a, b)
}

/** Creates the first admin, already confirmed: holding the logged token proves who the operator is. */
export async function completeSetup(
  db: Db,
  { preset, publicUrl }: { preset?: string; publicUrl: string },
  input: SetupInput,
) {
  if (await isSetupComplete(db)) throw new BackendError('conflict', 'Valley is already set up')
  if (!matches(input.token, setupToken({ preset, publicUrl }))) {
    throw new BackendError(
      'forbidden',
      'This setup link is invalid. Use the one from the server log',
    )
  }

  const passwordHash = await hashPassword(input.password)

  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${SETUP_LOCK})`)
    const [admin] = await tx
      .select({ id: user.id })
      .from(user)
      .innerJoin(account, and(eq(account.userId, user.id), eq(account.providerId, 'credential')))
      .where(eq(user.role, 'admin'))
      .limit(1)
    if (admin) throw new BackendError('conflict', 'Valley is already set up')

    const [taken] = await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, input.email))
      .limit(1)
    if (taken) throw new BackendError('conflict', 'An account with this email already exists')

    const id = nanoid(32)
    await tx.insert(user).values({
      id,
      name: input.name,
      email: input.email,
      emailVerified: true,
      role: 'admin',
      approvedAt: new Date(),
    })
    await tx.insert(account).values({
      id: nanoid(32),
      userId: id,
      accountId: id,
      providerId: 'credential',
      password: passwordHash,
    })
  })

  state.complete = true
  state.token = undefined
}
