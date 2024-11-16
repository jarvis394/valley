import { invariant } from '../../../utils/invariant'
import { redirect } from '@remix-run/node'
import { type VerifyFunctionArgs } from '../verify+/verify.server'
import {
  authenticator,
  requireAnonymous,
} from '../../../server/auth/auth.server'
import { z } from 'zod'
import { connectionSessionStorage } from '../../../server/auth/connections.server'
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

  if (!currentOnboardingStep) {
    currentOnboardingStep = 'language-select'
    onboardingSession.set('onboardingStep', currentOnboardingStep)
  }

  if (providerName) {
    const { email } = await requireProviderData(request)
    const connectionSession = await connectionSessionStorage.getSession(
      request.headers.get('cookie')
    )
    const prefilledProfile = onboardingSession.get('prefilledProfile')
    const formError = connectionSession.get(authenticator.sessionErrorKey)
    const hasError = typeof formError === 'string'

    return {
      currentOnboardingStep,
      submission: {
        status: hasError ? 'error' : undefined,
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
        error: { '': hasError ? [formError] : [] },
      },
    }
  } else {
    const email = await requireOnboardingEmail(request)

    return {
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

export async function handleVerification({ submission }: VerifyFunctionArgs) {
  invariant(
    submission.status === 'success',
    'Submission should be successful by now'
  )

  const onboardingSession = await onboardingSessionStorage.getSession()
  let currentOnboardingStep = onboardingSession.get('onboardingStep')
  onboardingSession.set('email', submission.value.target)

  if (!currentOnboardingStep) {
    currentOnboardingStep = 'language-select'
    onboardingSession.set('onboardingStep', currentOnboardingStep)
  }

  return redirect('/auth/onboarding/' + currentOnboardingStep, {
    headers: combineHeaders({
      'set-cookie': await onboardingSessionStorage.commitSession(
        onboardingSession
      ),
    }),
  })
}
