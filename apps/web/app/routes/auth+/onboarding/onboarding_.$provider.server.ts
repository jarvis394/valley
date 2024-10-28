import { invariant } from '../../../utils/invariant'
import { redirect } from '@remix-run/node'
import { verifySessionStorage } from '../../../server/verification.server'
import { onboardingEmailSessionKey } from '.'
import { type VerifyFunctionArgs } from '../verify/verify.server'

export async function handleVerification({ submission }: VerifyFunctionArgs) {
  invariant(
    submission.status === 'success',
    'Submission should be successful by now'
  )
  const verifySession = await verifySessionStorage.getSession()
  verifySession.set(onboardingEmailSessionKey, submission.value.target)
  return redirect('/onboarding', {
    headers: {
      'set-cookie': await verifySessionStorage.commitSession(verifySession),
    },
  })
}
