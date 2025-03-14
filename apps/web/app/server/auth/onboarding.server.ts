import { createCookieSessionStorage } from '@remix-run/node'
import { InterfaceLanguage } from '../../config/language'
import type { Account, User } from '@valley/db'
import { ProviderName } from '../../config/connections'

export type OnboardingStep = 'language-select' | 'security' | 'details'

export const onboardingSessionStorage = createCookieSessionStorage<{
  userId: User['id']
  userName: User['name']
  onboardingStep: OnboardingStep
  interfaceLanguage: InterfaceLanguage
  providerUserId: Account['providerId']
  email: string
  usePassword: boolean
  password?: string
  firstName: string
  lastName?: string
  phone?: string
}>({
  cookie: {
    name: 'valley_onboarding',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes, same as verification expiry
    secrets: process.env.SESSION_SECRET.split(','),
    secure: process.env.NODE_ENV === 'production',
  },
})
