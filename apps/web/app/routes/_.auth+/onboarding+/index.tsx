import { redirect } from 'react-router'
import { requireOnboardingData } from './onboarding.server'
import { Route } from './+types'

/** Redirect user to the current onboarding step */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const data = await requireOnboardingData(request)
  const redirectUrl = new URL(request.url)

  redirectUrl.pathname = '/auth/onboarding/' + data.currentOnboardingStep

  return redirect(redirectUrl.toString())
}

export const shouldRevalidate = () => false
