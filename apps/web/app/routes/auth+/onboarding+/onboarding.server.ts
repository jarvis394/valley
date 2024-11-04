import { invariant } from '../../../utils/invariant'
import { redirect } from '@remix-run/node'
import { verifySessionStorage } from '../../../server/verification.server'
import { type VerifyFunctionArgs } from '../verify/verify.server'
import { authenticator, requireAnonymous } from '../../../server/auth.server'
import { z } from 'zod'
import {
  prefilledProfileKey,
  providerIdKey,
  providerNameKey,
} from '../onboarding_.$provider'
import { SubmissionResult } from '@conform-to/react'
import { connectionSessionStorage } from '../../../server/connections.server'
import { combineHeaders } from 'app/utils/misc'
import { onboardingSessionStorage } from 'app/server/onboarding.server'

export const onboardingEmailSessionKey = 'onboardingEmail'
export const onboardingStepKey = 'onboardingStep'

export async function requireOnboardingEmail(request: Request) {
  await requireAnonymous(request)

  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )
  const email = verifySession.get(onboardingEmailSessionKey)

  if (typeof email !== 'string' || !email) {
    throw redirect('/auth/register')
  }

  return email
}

export async function requireProviderData(request: Request) {
  await requireAnonymous(request)

  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )
  const email = verifySession.get(onboardingEmailSessionKey)
  const providerId = verifySession.get(providerIdKey)
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
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )
  const currentOnboardingStep = verifySession.get(onboardingStepKey)
  const providerName = verifySession.get(providerNameKey)

  if (providerName) {
    const { email } = await requireProviderData(request)
    const connectionSession = await connectionSessionStorage.getSession(
      request.headers.get('cookie')
    )
    const prefilledProfile = verifySession.get(prefilledProfileKey)
    const formError = connectionSession.get(authenticator.sessionErrorKey)
    const hasError = typeof formError === 'string'

    return {
      email,
      currentOnboardingStep,
      submission: {
        status: hasError ? 'error' : undefined,
        initialValue: prefilledProfile ?? {},
        error: { '': hasError ? [formError] : [] },
      } as SubmissionResult,
    }
  } else {
    const email = await requireOnboardingEmail(request)

    return {
      email,
      currentOnboardingStep,
      submission: {
        initialValue: { email },
      } as SubmissionResult,
    }
  }
}

export async function handleVerification({ submission }: VerifyFunctionArgs) {
  invariant(
    submission.status === 'success',
    'Submission should be successful by now'
  )

  const verifySession = await verifySessionStorage.getSession()
  const onboardingSession = await onboardingSessionStorage.getSession()
  let currentOnboardingStep = verifySession.get(onboardingStepKey)
  verifySession.set(onboardingEmailSessionKey, submission.value.target)

  if (!currentOnboardingStep) {
    currentOnboardingStep = 'language-select'
    onboardingSession.set(onboardingStepKey, currentOnboardingStep)
  }

  return redirect('/auth/onboarding/' + currentOnboardingStep, {
    headers: combineHeaders(
      {
        'set-cookie': await verifySessionStorage.commitSession(verifySession),
      },
      {
        'set-cookie': await onboardingSessionStorage.commitSession(
          onboardingSession
        ),
      }
    ),
  })
}
