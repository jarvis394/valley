import { redirect } from '@remix-run/node'
import { getSession, requireAnonymous } from 'app/server/auth/auth.server'
import { z } from 'zod'
import { combineHeaders } from '../../../utils/misc'
import { onboardingSessionStorage } from '../../../server/auth/onboarding.server'
import { ProviderUser } from '../../../server/auth/providers/provider'

export async function requireOnboardingEmail(request: Request) {
  await requireAnonymous(request)

  const onboardingSession = await onboardingSessionStorage.getSession(
    request.headers.get('cookie')
  )
  const email = onboardingSession.get('email')

  if (typeof email !== 'string' || !email) {
    throw redirect('/auth/register')
  }

  return email
}

export async function requireProviderData(request: Request) {
  await requireAnonymous(request)

  const onboardingSession = await onboardingSessionStorage.getSession(
    request.headers.get('cookie')
  )
  const email = onboardingSession.get('email')
  const providerId = onboardingSession.get('providerUserId')
  const result = z
    .object({
      email: z.string(),
      providerId: z.string(),
    })
    .safeParse({ email, providerId })

  if (result.success) {
    return result.data
  } else {
    throw redirect('/auth/register')
  }
}

export async function requireOnboardingData(request: Request) {
  const onboardingSession = await onboardingSessionStorage.getSession(
    request.headers.get('cookie')
  )
  const providerName = onboardingSession.get('provider')
  const interfaceLanguage = onboardingSession.get('interfaceLanguage')
  const usePassword = onboardingSession.get('usePassword')
  const password = onboardingSession.get('password')
  const firstName = onboardingSession.get('firstName')
  const lastName = onboardingSession.get('lastName')
  const phone = onboardingSession.get('phone')
  let currentOnboardingStep = onboardingSession.get('onboardingStep')
  let userId = onboardingSession.get('userId')

  if (!currentOnboardingStep) {
    currentOnboardingStep = 'language-select'
    onboardingSession.set('onboardingStep', currentOnboardingStep)
  }

  if (!userId) {
    const session = await getSession(request)
    if (!session) throw redirect('/auth/login')
    userId = session.user.id
  }

  if (providerName) {
    const { email } = await requireProviderData(request)
    const prefilledProfile = onboardingSession.get('prefilledProfile')

    return {
      userId,
      currentOnboardingStep,
      submission: {
        status: undefined,
        prefilledProfile,
        data: {
          interfaceLanguage,
          usePassword,
          password,
          firstName,
          lastName,
          phone,
          email,
        },
        error: { '': [] },
      },
    }
  } else {
    const email = await requireOnboardingEmail(request)

    return {
      userId,
      currentOnboardingStep,
      submission: {
        status: undefined,
        prefilledProfile: {} as ProviderUser,
        data: {
          email,
          interfaceLanguage,
          usePassword,
          password,
          firstName,
          lastName,
          phone,
        },
      },
    }
  }
}

export async function handleVerification({
  target,
  headers,
}: {
  target: string
  headers: Headers
}) {
  const onboardingSession = await onboardingSessionStorage.getSession()
  let currentOnboardingStep = onboardingSession.get('onboardingStep')
  onboardingSession.set('email', target)

  if (!currentOnboardingStep) {
    currentOnboardingStep = 'language-select'
    onboardingSession.set('onboardingStep', currentOnboardingStep)
  }

  return redirect('/auth/onboarding/' + currentOnboardingStep, {
    headers: combineHeaders(
      {
        'set-cookie':
          await onboardingSessionStorage.commitSession(onboardingSession),
      },
      headers
    ),
  })
}
