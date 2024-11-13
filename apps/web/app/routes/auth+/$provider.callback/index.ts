import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import {
  PROVIDER_LABELS,
  ProviderNameSchema,
} from '../../../config/connections'
import {
  authenticator,
  getUserId,
  getSessionExpirationDate,
} from '../../../server/auth/auth.server'
import { prisma } from '../../../server/db.server'
import {
  normalizeEmail,
  normalizeUsername,
  ProviderUser,
} from '../../../server/auth/providers/provider'
import {
  destroyRedirectToHeader,
  getRedirectCookieValue,
} from '../../../server/redirect-cookie.server'
import {
  redirectWithToast,
  createToastHeaders,
} from '../../../server/toast.server'
import { verifySessionStorage } from '../../../server/auth/verification.server'
import { combineHeaders } from '../../../utils/misc'
import { handleNewSession } from '../login/login.server'
import { redirectToKey } from '../verify'
import { onboardingSessionStorage } from 'app/server/auth/onboarding.server'
import { providerNameQueryKey } from '../$provider'

const destroyRedirectTo = { 'set-cookie': destroyRedirectToHeader }

export async function loader({ request, params }: LoaderFunctionArgs) {
  const providerName = ProviderNameSchema.parse(params.provider)
  const redirectTo = getRedirectCookieValue(request)
  const label = PROVIDER_LABELS[providerName]

  let profile: ProviderUser
  try {
    profile = await authenticator.authenticate(providerName, request)
  } catch (e) {
    console.error('auth/provider/callback:', e)
    throw await redirectWithToast(
      '/auth/login',
      {
        title: 'Auth Failed',
        description: `There was an error authenticating with ${label}.`,
        type: 'error',
      },
      { headers: destroyRedirectTo }
    )
  }

  const existingConnection = await prisma.connection.findUnique({
    select: { userId: true },
    where: {
      providerName_providerId: { providerName, providerId: profile.id },
    },
  })

  const userId = await getUserId(request)

  if (existingConnection && userId) {
    if (existingConnection.userId === userId) {
      return redirectWithToast(
        '/settings/profile/connections',
        {
          title: 'Already Connected',
          description: `Your "${profile.username}" ${label} account is already connected.`,
        },
        { headers: destroyRedirectTo }
      )
    } else {
      return redirectWithToast(
        '/settings/profile/connections',
        {
          title: 'Already Connected',
          description: `The "${profile.username}" ${label} account is already connected to another account.`,
        },
        { headers: destroyRedirectTo }
      )
    }
  }

  // If we're already logged in, then link the account
  if (userId) {
    await prisma.connection.create({
      data: {
        providerName,
        providerId: profile.id,
        userId,
      },
    })
    return redirectWithToast(
      '/settings/profile/connections',
      {
        title: 'Connected',
        type: 'success',
        description: `Your "${profile.username}" ${label} account has been connected.`,
      },
      { headers: destroyRedirectTo }
    )
  }

  // Connection exists already? Make a new session
  if (existingConnection) {
    return makeSession({ request, userId: existingConnection.userId })
  }

  // if the email matches a user in the db, then link the account and
  // make a new session
  const user = await prisma.user.findUnique({
    select: { id: true },
    where: { email: profile.email.toLowerCase() },
  })

  if (user) {
    await prisma.connection.create({
      data: {
        providerName,
        providerId: profile.id,
        userId: user.id,
      },
    })
    return makeSession(
      { request, userId: user.id },
      {
        headers: await createToastHeaders({
          title: 'Connected',
          description: `Your "${profile.username}" ${label} account has been connected.`,
        }),
      }
    )
  }

  // Any other case -- this is a new user, so let's get them onboarded
  const verifySession = await verifySessionStorage.getSession()
  const onboardingSession = await onboardingSessionStorage.getSession()
  onboardingSession.set('email', profile.email)
  onboardingSession.set('prefilledProfile', {
    ...profile,
    email: normalizeEmail(profile.email),
    username:
      typeof profile.username === 'string'
        ? normalizeUsername(profile.username)
        : undefined,
  })
  onboardingSession.set('providerUserId', profile.id)
  onboardingSession.set('provider', providerName)
  let currentOnboardingStep = onboardingSession.get('onboardingStep')

  if (!currentOnboardingStep) {
    currentOnboardingStep = 'language-select'
    onboardingSession.set('onboardingStep', currentOnboardingStep)
  }

  const onboardingRedirectParams = new URLSearchParams()
  onboardingRedirectParams.set(providerNameQueryKey, providerName)
  if (redirectTo) {
    onboardingRedirectParams.set(redirectToKey, redirectTo)
  }

  const onboardingRedirect = [
    '/auth/onboarding/',
    currentOnboardingStep,
    '?',
    onboardingRedirectParams.toString(),
  ].join('')

  return redirect(onboardingRedirect, {
    headers: combineHeaders(
      { 'set-cookie': await verifySessionStorage.commitSession(verifySession) },
      {
        'set-cookie':
          await onboardingSessionStorage.commitSession(onboardingSession),
      },
      destroyRedirectTo
    ),
  })
}

async function makeSession(
  {
    request,
    userId,
    redirectTo,
  }: { request: Request; userId: string; redirectTo?: string | null },
  responseInit?: ResponseInit
) {
  redirectTo ??= '/projects'
  const session = await prisma.session.create({
    select: { id: true, expirationDate: true, userId: true },
    data: {
      expirationDate: getSessionExpirationDate(),
      userId,
    },
  })
  return handleNewSession(
    { request, session, redirectTo },
    {
      headers: combineHeaders(responseInit?.headers, destroyRedirectTo),
    }
  )
}
