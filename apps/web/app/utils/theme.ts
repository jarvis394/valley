import * as cookie from 'cookie'

const themeCookieName = 'valley_theme'
export type Theme = 'light' | 'dark'

export function getTheme(request: Request): Theme | null {
  const cookieHeader = request.headers.get('cookie')
  const parsed = cookieHeader
    ? cookie.parse(cookieHeader)[themeCookieName]
    : 'light'
  if (parsed === 'light' || parsed === 'dark') return parsed
  return null
}

export function setTheme(theme: Theme | 'system') {
  if (theme === 'system') {
    return cookie.serialize(themeCookieName, '', { path: '/', maxAge: -1 })
  } else {
    return cookie.serialize(themeCookieName, theme, {
      path: '/',
      maxAge: 31_536_000, // 1 year
    })
  }
}
