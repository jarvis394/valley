import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db, schema } from '@valley/db'
import { sendAuthEmail } from './lib/email'
import { emailOTP, magicLink } from 'better-auth/plugins'

export const auth = betterAuth({
  appName: 'valley',
  secret: process.env.SESSION_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
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
  rateLimit: {
    enabled: true,
    storage: 'memory',
    window: 60,
    max: 10,
  },
})
