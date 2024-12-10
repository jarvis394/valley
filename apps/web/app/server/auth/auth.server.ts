import type { User, Password, Connection } from '@valley/db'
import { redirect } from '@remix-run/cloudflare'
import bcrypt from 'bcryptjs'
import { Authenticator } from 'remix-auth'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { connectionSessionStorage, providers } from './connections.server'
import { prisma } from '../db.server'
import { combineHeaders } from '../../utils/misc'
import { normalizeEmail, type ProviderUser } from './providers/provider'
import { authSessionStorage } from './session.server'
import { UserSettings } from '@valley/db'
import { invariantResponse } from '../../utils/invariant'

// TODO: think about refreshing sessions
export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30 // 30 days
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME)

export const authenticator = new Authenticator<ProviderUser>(
  connectionSessionStorage
)

// Register auth providers
for (const [providerName, provider] of Object.entries(providers)) {
  authenticator.use(provider.getAuthStrategy(), providerName)
}

type RedirectToProps = { redirectTo?: string | null }

function getUnauthenticatedRedirectUrl(
  request: Request,
  { redirectTo }: RedirectToProps = {}
) {
  const requestUrl = new URL(request.url)

  if (!redirectTo) {
    redirectTo = `${requestUrl.pathname}${requestUrl.search}`
  }

  const loginParams = new URLSearchParams({ redirectTo })
  const loginSearchParams = redirectTo ? loginParams.toString() : ''
  const loginRedirect = ['/auth/login', loginSearchParams].join('?')
  return loginRedirect
}

export async function getUserIdFromSession(request: Request) {
  const cookieHeader = request.headers.get('cookie')
  const authSession = await authSessionStorage.getSession(cookieHeader)
  return authSession.get('userId')
}

export async function getUserId(request: Request) {
  const cookieHeader = request.headers.get('cookie')
  const authSession = await authSessionStorage.getSession(cookieHeader)
  const sessionId = authSession.get('sessionId')
  if (!sessionId) return null

  const session = await prisma.session.findUnique({
    select: { user: { select: { id: true } } },
    where: { id: sessionId, expirationDate: { gt: new Date() } },
  })

  // Other handlers might un-authenticate user,
  // redirect them to the home page
  if (!session?.user) {
    throw redirect('/auth/login', {
      headers: {
        'set-cookie': await authSessionStorage.destroySession(authSession),
      },
    })
  }

  return session.user.id
}

export async function requireUserId(
  request: Request,
  { redirectTo }: RedirectToProps = {}
) {
  const userId = await getUserId(request)

  if (!userId) {
    throw redirect(getUnauthenticatedRedirectUrl(request, { redirectTo }))
  }

  return userId
}

export async function requireUser(
  request: Request,
  { redirectTo }: RedirectToProps = {}
) {
  const userId = await requireUserId(request, { redirectTo })
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  invariantResponse(user, 'User not found', { status: 404 })

  return user
}

export async function isLoggedIn(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie')
  )
  return !!authSession.data.sessionId
}

/**
 * Redirects to the auth login page if client is not logged in
 * NOTE: checks only auth cookie
 */
export async function requireLoggedIn(request: Request) {
  const loggedIn = await isLoggedIn(request)
  const redirectUrl = getUnauthenticatedRedirectUrl(request)
  if (!loggedIn) throw redirect(redirectUrl)

  return true
}

/** Redirects to the projects page if client is logged in */
export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request)

  if (userId) {
    throw redirect('/projects')
  }
}

export async function login({
  email,
  password,
}: {
  email: User['email']
  password: string
}) {
  const user = await verifyUserPassword({ email }, password)
  if (!user) return null

  const session = await prisma.session.create({
    select: { id: true, expirationDate: true, userId: true },
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    },
  })

  return session
}

export async function resetUserPassword({
  email,
  password,
}: {
  email: User['email']
  password: string
}) {
  const hashedPassword = await getPasswordHash(password)
  return prisma.user.update({
    where: { email },
    data: {
      password: {
        update: {
          hash: hashedPassword,
        },
      },
    },
  })
}

export async function register({
  email,
  fullname,
  phone,
  password,
  connection,
}: {
  email: User['email']
  fullname: User['fullname']
  phone?: UserSettings['phone']
  password?: string
  connection?: {
    providerId: Connection['providerId']
    providerName: Connection['providerName']
    imageUrl?: string
  }
}) {
  const hashedPassword = password && (await getPasswordHash(password))

  const session = await prisma.session.create({
    // TODO: add imageUrl upload
    data: {
      expirationDate: getSessionExpirationDate(),
      user: {
        create: {
          email: normalizeEmail(email),
          // TODO: think about normalizing fullname
          fullname: fullname.trim(),
          roles: { connect: { name: 'user' } },
          connections: connection
            ? {
                create: {
                  providerId: connection.providerId,
                  providerName: connection.providerName,
                },
              }
            : undefined,
          settings: {
            create: {
              phone,
            },
          },
          password: hashedPassword
            ? {
                create: {
                  hash: hashedPassword,
                },
              }
            : undefined,
        },
      },
    },
    select: { id: true, expirationDate: true, userId: true },
  })

  return session
}

export async function logout(
  {
    request,
    redirectTo = '/home',
  }: {
    request: Request
    redirectTo?: string
  },
  responseInit?: ResponseInit
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie')
  )
  const sessionId = authSession.get('sessionId')
  // if this fails, we still need to delete the session from the user's browser
  // and it doesn't do any harm staying in the db anyway.
  if (sessionId) {
    // the .catch is important because that's what triggers the query.
    // learn more about PrismaPromise: https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismapromise-behavior
    void prisma.session.deleteMany({ where: { id: sessionId } }).catch(() => {})
  }

  throw redirect(safeRedirect(redirectTo), {
    ...responseInit,
    headers: combineHeaders(
      { 'set-cookie': await authSessionStorage.destroySession(authSession) },
      responseInit?.headers
    ),
  })
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10)
  return hash
}

export async function verifyUserPassword(
  where: Pick<User, 'email'> | Pick<User, 'id'>,
  password: Password['hash']
) {
  const userWithPassword = await prisma.user.findUnique({
    where,
    select: { id: true, password: { select: { hash: true } } },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  return { id: userWithPassword.id }
}
