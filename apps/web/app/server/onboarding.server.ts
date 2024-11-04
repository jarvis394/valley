import { createCookieSessionStorage } from '@remix-run/node'

export const onboardingSessionStorage = createCookieSessionStorage({
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
