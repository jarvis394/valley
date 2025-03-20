import { redirect } from 'react-router'
import { auth } from '@valley/auth'

type RedirectToProps = { redirectTo?: string | null }

export function getUnauthenticatedRedirectUrl(
  request: Request,
  { redirectTo }: RedirectToProps = {}
) {
  const requestUrl = new URL(request.url)

  if (!redirectTo) {
    redirectTo = `${requestUrl.pathname}${requestUrl.search}`
  }

  const loginParams = new URLSearchParams({ redirectTo })
  const loginSearchParams = redirectTo ? loginParams.toString() : ''
  const loginRedirect = ['/auth/login', loginSearchParams].join('?')
  return loginRedirect
}

export const getSession = (
  request: Request,
  query?: {
    disableCookieCache?: boolean
  }
) =>
  auth.api.getSession({
    ...query,
    headers: request.headers,
  })

export const requireAnonymous = async (request: Request) => {
  const pathname = new URL(request.url).pathname
  const session = await getSession(request, {
    disableCookieCache: true,
  })

  if (session && session.user.onboarded) {
    throw redirect('/projects')
  }

  if (
    session &&
    !session.user.onboarded &&
    // TODO: kinda hacky, maybe refactor
    // Do not infinitely redirect user on onboarding
    !pathname.startsWith('/auth/onboarding')
  ) {
    throw redirect('/auth/onboarding')
  }
}

export async function getUserId(
  request: Request,
  { redirectTo }: RedirectToProps = {}
) {
  const session = await getSession(request)

  // Other handlers might un-authenticate user,
  // redirect them to the home page
  if (!session) {
    throw redirect(getUnauthenticatedRedirectUrl(request, { redirectTo }))
  }

  if (session && !session.user.onboarded) {
    throw redirect('/auth/onboarding')
  }

  return session.user.id
}

export async function requireUserId(
  request: Request,
  { redirectTo }: RedirectToProps = {}
) {
  const userId = await getUserId(request)

  if (!userId) {
    throw redirect(getUnauthenticatedRedirectUrl(request, { redirectTo }))
  }

  return userId
}

export async function requireUser(
  request: Request,
  { redirectTo }: RedirectToProps = {}
) {
  const session = await getSession(request)

  if (!session) {
    throw redirect(getUnauthenticatedRedirectUrl(request, { redirectTo }))
  }

  return session.user
}
