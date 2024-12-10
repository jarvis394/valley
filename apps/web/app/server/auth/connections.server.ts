import { createCookieSessionStorage } from '@remix-run/cloudflare'
import { type ProviderName } from '../../config/connections'
import { type AuthProvider } from './providers/provider'
import { type Timings } from '../timing.server'
import { GitHubProvider } from './providers/github.server'
import { GoogleProvider } from './providers/google.server'
import { VKProvider } from './providers/vk.server'

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
  google: new GoogleProvider(),
  vk: new VKProvider(),
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
