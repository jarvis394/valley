import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { requireOnboardingData } from './onboarding.server'

/** Redirect user to the current onboarding step */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const data = await requireOnboardingData(request)
  const redirectUrl = new URL(request.url)

  redirectUrl.pathname = '/auth/onboarding/' + data.currentOnboardingStep

  return redirect(redirectUrl.toString())
}
