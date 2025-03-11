import { redirect } from '@remix-run/node'
import { auth } from '@valley/auth'
import { invariantResponse } from 'app/utils/invariant'

type RedirectToProps = { redirectTo?: string | null }

function getUnauthenticatedRedirectUrl(
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

export const requireAnonymous = async (request: Request) => {
  const session = await auth.api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: request.headers,
  })

  if (session) {
    throw redirect('/projects')
  }
}

export async function getUserId(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })

  // Other handlers might un-authenticate user,
  // redirect them to the home page
  if (!session) {
    throw redirect('/auth/login')
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
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    throw redirect('/auth/login')
  }

  return session.user
}
