import { createCookieSessionStorage } from '@remix-run/node'

export const authSessionStorage = createCookieSessionStorage<{
  /** Unix timextamp of when user submitted verification request */
  verifiedTime: number
  sessionId: string
  expires: Date
  userId: string
}>({
  cookie: {
    name: 'valley_session',
    path: '/',
    isSigned: true,
    // TODO: need to rethink whole architecture with different domains (JWT maybe?)
    httpOnly: false,
    sameSite: 'none',
    secrets: process.env.SESSION_SECRET.split(','),
    secure: true,
  },
})

// We have to do this because every time you commit the session you overwrite it
// so we store the expiration time in the cookie and reset it every time we commit
const originalCommitSession = authSessionStorage.commitSession

Object.defineProperty(authSessionStorage, 'commitSession', {
  value: async function commitSession(
    ...args: Parameters<typeof originalCommitSession>
  ) {
    const [session, options] = args
    if (options?.expires) {
      session.set('expires', options.expires)
    }
    if (options?.maxAge) {
      session.set('expires', new Date(Date.now() + options.maxAge * 1000))
    }
    const sessionExpires = session.get('expires')
    const expires = sessionExpires ? new Date(sessionExpires) : undefined
    const setCookieHeader = await originalCommitSession(session, {
      ...options,
      expires,
    })
    return setCookieHeader
  },
})
