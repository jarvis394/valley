import type { User, Password, Connection } from '@prisma/client'
import { redirect } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { Authenticator } from 'remix-auth'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { connectionSessionStorage, providers } from './connections.server'
import { prisma } from './db.server'
import { combineHeaders } from '../utils/misc'
import {
  normalizeEmail,
  normalizeUsername,
  type ProviderUser,
} from './providers/provider'
import { authSessionStorage } from './session.server'
import { TOTP_PROVIDER_NAME } from 'app/config/connections'

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30 // 30 days
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME)

export const sessionKey = 'sessionId'

export const authenticator = new Authenticator<ProviderUser>(
  connectionSessionStorage
)

// Register auth providers
for (const [providerName, provider] of Object.entries(providers)) {
  authenticator.use(provider.getAuthStrategy(), providerName)
}

export async function getUserId(request: Request) {
  const cookieHeader = request.headers.get('cookie')
  const authSession = await authSessionStorage.getSession(cookieHeader)
  const sessionId = authSession.get(sessionKey)
  if (!sessionId) return null

  const session = await prisma.session.findUnique({
    select: { user: { select: { id: true } } },
    where: { id: sessionId, expirationDate: { gt: new Date() } },
  })

  // Other handlers might un-authenticate user,
  // redirect them to the home page
  if (!session?.user) {
    throw redirect('/', {
      headers: {
        'set-cookie': await authSessionStorage.destroySession(authSession),
      },
    })
  }

  return session.user.id
}

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {}
) {
  const userId = await getUserId(request)

  if (!userId) {
    const requestUrl = new URL(request.url)

    if (!redirectTo) {
      redirectTo = `${requestUrl.pathname}${requestUrl.search}`
    }

    const loginParams = new URLSearchParams({ redirectTo })
    const loginSearchParams = redirectTo ? loginParams.toString() : ''
    const loginRedirect = ['/login', loginSearchParams].join('?')
    throw redirect(loginRedirect)
  }

  return userId
}

/** Redirects to the home page if client is logged in */
export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request)

  if (userId) {
    throw redirect('/')
  }
}

/**
 * Sends magic link and OTP code to user's email
 * if no password is connected to the account,
 * otherwise, redirects to `/auth/login/email` form
 */
export async function doEmailAuthorization({
  email,
  request,
}: {
  email: User['email']
  request: Request
}) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { password: true },
  })

  if (!user) {
    return null
  } else if (user.password) {
    return null
  }
  
  const authentictedUser = await authenticator.authenticate(TOTP_PROVIDER_NAME, request)
  const session = await prisma.session.create({
    select: { id: true, expirationDate: true, userId: true },
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: authentictedUser.id,
    },
  })

  return session
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
  username,
  password,
}: {
  username: User['username']
  password: string
}) {
  const hashedPassword = await getPasswordHash(password)
  return prisma.user.update({
    where: { username },
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
  username,
  password,
}: {
  email: User['email']
  username: User['username']
  password: string
}) {
  const hashedPassword = await getPasswordHash(password)

  const session = await prisma.session.create({
    data: {
      expirationDate: getSessionExpirationDate(),
      user: {
        create: {
          email: normalizeEmail(email),
          username: normalizeUsername(username),
          roles: { connect: { name: 'user' } },
          password: {
            create: {
              hash: hashedPassword,
            },
          },
        },
      },
    },
    select: { id: true, expirationDate: true },
  })

  return session
}

export async function signupWithConnection({
  email,
  username,
  providerId,
  providerName,
  // imageUrl,
}: {
  email: User['email']
  username: User['username']
  providerId: Connection['providerId']
  providerName: Connection['providerName']
  imageUrl?: string
}) {
  const session = await prisma.session.create({
    data: {
      expirationDate: getSessionExpirationDate(),
      user: {
        create: {
          email: normalizeEmail(email),
          username: normalizeUsername(username),
          roles: { connect: { name: 'user' } },
          connections: { create: { providerId, providerName } },
          // TODO: add imageUrl upload
          image: undefined,
        },
      },
    },
    select: { id: true, expirationDate: true },
  })

  return session
}

export async function logout(
  {
    request,
    redirectTo = '/',
  }: {
    request: Request
    redirectTo?: string
  },
  responseInit?: ResponseInit
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie')
  )
  const sessionId = authSession.get(sessionKey)
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
