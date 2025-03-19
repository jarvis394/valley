import { redirectToKey } from 'app/config/paramsKeys'
import * as cookie from 'cookie'

export const destroyRedirectToHeader = cookie.serialize(redirectToKey, '', {
  maxAge: -1,
})

export function getRedirectCookieHeader(redirectTo?: string) {
  return redirectTo && redirectTo !== '/'
    ? cookie.serialize(redirectToKey, redirectTo, { maxAge: 60 * 10 })
    : null
}

export function getRedirectCookieValue(request: Request) {
  const rawCookie = request.headers.get('cookie')
  const parsedCookies = rawCookie ? cookie.parse(rawCookie) : {}
  const redirectTo = parsedCookies[redirectToKey]
  return redirectTo || null
}
