import { account, and, count, eq, ne, session, user, verification, type Db } from '@valley/db'
import type { Storage } from '@valley/storage'
import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { cleanupUserStorage } from '../accounts'
import type { AuthEnv } from '../env'
import { type Mailer, resetPasswordMail, verifyEmailMail } from '../mail'
import { isSetupComplete } from '../setup'
import { emailChange } from './email-plugin'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, isApproved, resolveNewUserAccess } from './rules'

const RESET_PASSWORD_TTL_HOURS = 1

async function ensureAnotherAdmin(db: Db, id: string) {
  const [target] = await db.select({ role: user.role }).from(user).where(eq(user.id, id)).limit(1)
  if (target?.role !== 'admin') return

  const [others] = await db
    .select({ n: count() })
    .from(user)
    .where(and(eq(user.role, 'admin'), ne(user.id, id)))
  if (!others?.n) {
    throw new APIError('BAD_REQUEST', {
      message: 'Make another user an admin before deleting the last admin account',
    })
  }
}

export function createAuth({
  db,
  storage,
  mailer,
  env,
}: {
  db: Db
  storage: Storage
  mailer: Mailer
  env: AuthEnv
}) {
  return betterAuth({
    appName: 'Valley',
    baseURL: env.PUBLIC_URL,
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.PUBLIC_URL],
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      requireEmailVerification: true,
      resetPasswordTokenExpiresIn: RESET_PASSWORD_TTL_HOURS * 60 * 60,
      sendResetPassword: async ({ user: recipient, url }) => {
        await mailer.send(
          resetPasswordMail({
            to: recipient.email,
            url,
            expiresInHours: RESET_PASSWORD_TTL_HOURS,
          }),
        )
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      // Keep sign-up succeeding even if mail fails; signing in again sends a fresh link.
      sendVerificationEmail: async ({ user: recipient, url }) => {
        await mailer
          .send(
            verifyEmailMail({
              to: recipient.email,
              url,
              inviteOnly:
                env.VALLEY_SIGNUP_MODE === 'invite' &&
                !isApproved(recipient as { role?: string | null; approvedAt?: Date | null }),
            }),
          )
          .catch((error: unknown) =>
            console.warn(`Verification mail not sent for ${recipient.id}`, error),
          )
      },
    },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'user', input: false },
        approvedAt: { type: 'date', required: false, input: false },
      },
      deleteUser: {
        enabled: true,
        beforeDelete: async (target) => {
          await ensureAnotherAdmin(db, target.id)
          await cleanupUserStorage(db, storage, target.id)
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          async before(createdUser) {
            if (!(await isSetupComplete(db))) {
              throw new APIError('FORBIDDEN', { message: 'Finish setting up Valley first' })
            }

            return {
              data: { ...createdUser, ...resolveNewUserAccess(env.VALLEY_SIGNUP_MODE) },
            }
          },
        },
      },
    },
    plugins: [emailChange({ mailer })],
  })
}

export type Auth = ReturnType<typeof createAuth>
export { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, isApproved, resolveNewUserAccess } from './rules'
