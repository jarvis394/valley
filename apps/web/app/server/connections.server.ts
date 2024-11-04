import { createCookieSessionStorage } from '@remix-run/node'
import { type ProviderName } from '../config/connections'
import { GitHubProvider } from './providers/github.server'
import { type AuthProvider } from './providers/provider'
import { type Timings } from './timing.server'

export const connectionSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'valley_connection',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    secrets: process.env.SESSION_SECRET?.split(','),
    secure: process.env.NODE_ENV === 'production',
  },
})

export const providers: Record<ProviderName, AuthProvider> = {
  github: new GitHubProvider(),
  // TODO: change me
  google: new GitHubProvider(),
  // TODO: change me
  vk: new GitHubProvider(),
}

export function handleMockAction(providerName: ProviderName, request: Request) {
  return providers[providerName].handleMockAction(request)
}

export function resolveConnectionData(
  providerName: ProviderName,
  providerId: string,
  options?: { timings?: Timings }
) {
  return providers[providerName].resolveConnectionData(providerId, options)
}
