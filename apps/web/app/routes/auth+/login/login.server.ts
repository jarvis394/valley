import { invariant } from '../../../utils/invariant'
import { redirect } from 'react-router'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { getUserId } from '../../../server/auth/auth.server'
import { prisma } from '../../../server/db.server'
import { combineResponseInits } from '../../../utils/misc'
import { authSessionStorage } from '../../../server/auth/session.server'
import { redirectWithToast } from '../../../server/toast.server'
import { verifySessionStorage } from '../../../server/auth/verification.server'
import {
  getRedirectToUrl,
  type VerifyFunctionArgs,
} from '../verify+/verify.server'
import { twoFAVerificationType } from '../../_user+/account+/settings.authentication'

export async function handleNewSession(
  {
    request,
    session,
    redirectTo,
  }: {
    request: Request
    session: { userId: string; id: string; expirationDate: Date }
    redirectTo?: string
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
    verifySession.set('unverifiedSessionId', session.id)
    const redirectUrl = getRedirectToUrl({
      request,
      type: twoFAVerificationType,
      target: session.userId,
      redirectTo,
    })
    const headers = new Headers()
    headers.append(
      'set-cookie',
      await verifySessionStorage.commitSession(verifySession)
    )
    return redirect(
      `${redirectUrl.pathname}?${redirectUrl.searchParams}`,
      combineResponseInits({ headers }, responseInit)
    )
  } else {
    const authSession = await authSessionStorage.getSession(
      request.headers.get('cookie')
    )
    authSession.set('sessionId', session.id)
    authSession.set('userId', session.userId)
    const headers = new Headers()
    headers.append(
      'set-cookie',
      await authSessionStorage.commitSession(authSession, {
        expires: session.expirationDate,
      })
    )

    return redirect(
      safeRedirect(redirectTo),
      combineResponseInits({ headers }, responseInit)
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

  const { redirectTo } = submission.value
  const headers = new Headers()

  authSession.set('verifiedTime', Date.now())

  const unverifiedSessionId = verifySession.get('unverifiedSessionId')

  if (unverifiedSessionId) {
    const session = await prisma.session.findUnique({
      select: { expirationDate: true },
      where: { id: unverifiedSessionId },
    })

    if (!session) {
      throw await redirectWithToast('/auth/login', {
        type: 'error',
        title: 'Invalid session',
        description: 'Could not find session to verify. Please try again.',
      })
    }

    authSession.set('sessionId', unverifiedSessionId)

    headers.append(
      'set-cookie',
      await authSessionStorage.commitSession(authSession, {
        expires: session.expirationDate,
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

  return redirectWithToast(
    safeRedirect(redirectTo),
    {
      type: 'info',
      description: 'You are now logged in',
    },
    { headers }
  )
}

export async function shouldRequestTwoFA(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie')
  )
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )

  // Session is not verified, should proceed to 2FA
  if (verifySession.has('unverifiedSessionId')) return true

  const userId = await getUserId(request)
  if (!userId) return false

  // If it's over two hours since they last verified, we should request 2FA again
  const userHasTwoFA = await prisma.verification.findUnique({
    select: { id: true },
    where: { target_type: { target: userId, type: twoFAVerificationType } },
  })
  if (!userHasTwoFA) return false

  const verifiedTime = authSession.get('verifiedTime')
  // User has not done any verification, proceed to 2FA
  if (!verifiedTime) return true
  const twoHours = 1000 * 60 * 2

  return Date.now() - verifiedTime > twoHours
}
