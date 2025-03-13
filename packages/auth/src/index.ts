import { betterAuth, Account } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db, schema } from '@valley/db'
import { sendAuthEmail } from './lib/email'
import {
  createAuthMiddleware,
  emailOTP,
  ERROR_CODES,
  magicLink,
} from 'better-auth/plugins'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@valley/shared'
import { Toast, ToastInput } from '@valley/ui/Toast'
import { createCookieSessionStorage } from '@remix-run/node'

const toastSessionStorage = createCookieSessionStorage<{
  toast: Toast
}>({
  cookie: {
    name: 'valley_toast',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: process.env.SESSION_SECRET.split(','),
    secure: process.env.NODE_ENV === 'production',
  },
})

export const auth = betterAuth({
  appName: 'valley',
  secret: process.env.SESSION_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    usePlural: true,
  }),
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
  },
  emailVerification: {
    sendOnSignUp: false,
    sendVerificationEmail: async (data) => {
      await sendAuthEmail({
        code: data.token,
        email: data.user.email,
        magicLink: data.url,
      })
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      onboarded: {
        type: 'boolean',
        required: false,
        input: true,
      },
      domains: {
        type: 'string[]',
        required: false,
        input: false,
      },
      serviceDomain: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    vk: {
      clientId: process.env.VK_CLIENT_ID,
      clientSecret: process.env.VK_CLIENT_SECRET,
    },
  },
  advanced: {
    generateId: false,
    cookiePrefix: 'valley',
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async (data) => {
        await sendAuthEmail({
          code: data.otp,
          email: data.email,
        })
      },
      sendVerificationOnSignUp: true,
    }),
    magicLink({
      sendMagicLink: async (data) => {
        await sendAuthEmail({
          code: data.token,
          email: data.email,
          magicLink: data.url,
        })
      },
    }),
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/callback/:id') {
        const toast = {
          description: 'Your account is linked',
          type: 'info',
          id: 'login',
        } satisfies ToastInput
        if (ctx.context.newSession) {
          toast.description = 'You are now logged in'
        }

        const session = await toastSessionStorage.getSession()
        session.flash('toast', toast)
        const cookie = await toastSessionStorage.commitSession(session)

        ctx.setHeader('Set-Cookie', cookie)
      }
    }),
  },
  rateLimit: {
    enabled: true,
    storage: 'memory',
    window: 60,
    max: 10,
  },
})

export type Session = typeof auth.$Infer.Session
export { ERROR_CODES }
export type { Account }
