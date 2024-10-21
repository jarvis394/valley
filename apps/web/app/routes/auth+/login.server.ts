import { invariant } from '../../utils/invariant'
import { redirect } from '@remix-run/node'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { getUserId, sessionKey } from '../../server/auth.server'
import { prisma } from '../../server/db.server'
import { combineResponseInits } from '../../utils/misc'
import { authSessionStorage } from '../../server/session.server'
import { redirectWithToast } from '../../server/toast.server'
import { verifySessionStorage } from '../../server/verification.server'
import {
  getRedirectToUrl,
  type VerifyFunctionArgs,
} from './_verify/verify.server'
import { twoFAVerificationType } from '../account+/settings.authentication'

const verifiedTimeKey = 'verified-time'
const unverifiedSessionIdKey = 'unverified-session-id'
const rememberKey = 'remember'

export async function handleNewSession(
  {
    request,
    session,
    redirectTo,
    remember,
  }: {
    request: Request
    session: { userId: string; id: string; expirationDate: Date }
    redirectTo?: string
    remember: boolean
  },
  responseInit?: ResponseInit
) {
  const verification = await prisma.verification.findUnique({
    select: { id: true },
    where: {
      target_type: { target: session.userId, type: twoFAVerificationType },
    },
  })
  const userHasTwoFactor = Boolean(verification)

  if (userHasTwoFactor) {
    const verifySession = await verifySessionStorage.getSession()
    verifySession.set(unverifiedSessionIdKey, session.id)
    verifySession.set(rememberKey, remember)
    const redirectUrl = getRedirectToUrl({
      request,
      type: twoFAVerificationType,
      target: session.userId,
      redirectTo,
    })
    return redirect(
      `${redirectUrl.pathname}?${redirectUrl.searchParams}`,
      combineResponseInits(
        {
          headers: {
            'set-cookie':
              await verifySessionStorage.commitSession(verifySession),
          },
        },
        responseInit
      )
    )
  } else {
    const authSession = await authSessionStorage.getSession(
      request.headers.get('cookie')
    )
    authSession.set(sessionKey, session.id)

    return redirect(
      safeRedirect(redirectTo),
      combineResponseInits(
        {
          headers: {
            'set-cookie': await authSessionStorage.commitSession(authSession, {
              expires: remember ? session.expirationDate : undefined,
            }),
          },
        },
        responseInit
      )
    )
  }
}

export async function handleVerification({
  request,
  submission,
}: VerifyFunctionArgs) {
  invariant(
    submission.status === 'success',
    'Submission should be successful by now'
  )
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie')
  )
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )

  const remember = verifySession.get(rememberKey)
  const { redirectTo } = submission.value
  const headers = new Headers()

  authSession.set(verifiedTimeKey, Date.now())

  const unverifiedSessionId = verifySession.get(unverifiedSessionIdKey)

  if (unverifiedSessionId) {
    const session = await prisma.session.findUnique({
      select: { expirationDate: true },
      where: { id: unverifiedSessionId },
    })

    if (!session) {
      throw await redirectWithToast('/login', {
        type: 'error',
        title: 'Invalid session',
        description: 'Could not find session to verify. Please try again.',
      })
    }

    authSession.set(sessionKey, unverifiedSessionId)
    headers.append(
      'set-cookie',
      await authSessionStorage.commitSession(authSession, {
        expires: remember ? session.expirationDate : undefined,
      })
    )
  } else {
    headers.append(
      'set-cookie',
      await authSessionStorage.commitSession(authSession)
    )
  }

  headers.append(
    'set-cookie',
    await verifySessionStorage.destroySession(verifySession)
  )

  return redirect(safeRedirect(redirectTo), { headers })
}

export async function shouldRequestTwoFA(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie')
  )
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )

  if (verifySession.has(unverifiedSessionIdKey)) return true

  const userId = await getUserId(request)
  if (!userId) return false

  // if it's over two hours since they last verified, we should request 2FA again
  const userHasTwoFA = await prisma.verification.findUnique({
    select: { id: true },
    where: { target_type: { target: userId, type: twoFAVerificationType } },
  })
  if (!userHasTwoFA) return false

  const verifiedTime = authSession.get(verifiedTimeKey) ?? new Date(0)
  const twoHours = 1000 * 60 * 2

  return Date.now() - verifiedTime > twoHours
}
