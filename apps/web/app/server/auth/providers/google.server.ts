import { createId as cuid } from '@paralleldrive/cuid2'
import { redirect } from '@remix-run/cloudflare'
import { OIDCStrategy } from 'web-oidc/remix'
import { connectionSessionStorage } from '../connections.server'
import { redirectWithToast } from '../../toast.server'
import { type AuthProvider } from './provider'
import { getHostAdress } from '../../../server/utils/misc.server'

const shouldMock = process.env.GOOGLE_CLIENT_ID?.startsWith('MOCK_')
const redirectURI = getHostAdress() + '/auth/google/callback'

export class GoogleProvider implements AuthProvider {
  getAuthStrategy() {
    return new OIDCStrategy(
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectURI,
        authorizationParams: {
          scope: ['openid', 'email'],
        },
        issuer: 'https://accounts.google.com',
        response_type: 'code',
      },
      async ({ profile }) => {
        if (!profile.email || !profile.email_verified) {
          throw redirectWithToast('/login', {
            title: 'Cannot connect Google Account',
            description: 'Your Google Email is Unverified',
            type: 'error',
          })
        }
        return {
          email: profile.email,
          id: profile.sub,
          username: profile.preferred_username,
          name: profile.given_name,
          imageUrl: profile.picture,
        }
      }
    )
  }

  async resolveConnectionData(providerId: string) {
    // You may consider making a fetch request to Google to get the user's
    // profile or something similar here.
    return { displayName: providerId, link: null } as const
  }

  async handleMockAction(request: Request) {
    if (!shouldMock) return
    const connectionSession = await connectionSessionStorage.getSession(
      request.headers.get('cookie')
    )
    const state = cuid()
    connectionSession.set('oidc:state', state)
    const code = 'MOCK_CODE_GOOGLE_KODY'
    const searchParams = new URLSearchParams({ code, state })
    throw redirect(`/auth/google/callback?${searchParams}`, {
      headers: {
        'set-cookie': await connectionSessionStorage.commitSession(
          connectionSession
        ),
      },
    })
  }
}
