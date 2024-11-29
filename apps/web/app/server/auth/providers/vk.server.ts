import { createId as cuid } from '@paralleldrive/cuid2'
import { redirect } from '@vercel/remix'
import { VKStrategy } from 'remix-auth-vk'
import { connectionSessionStorage } from '../connections.server'
import { type AuthProvider } from './provider'
import { getHostAdress } from '../../utils/misc.server'

const shouldMock = process.env.VK_CLIENT_ID?.startsWith('MOCK_')
const redirectURI = getHostAdress() + '/auth/vk/callback'

export class VKProvider implements AuthProvider {
  getAuthStrategy() {
    return new VKStrategy(
      {
        clientID: process.env.VK_CLIENT_ID,
        clientSecret: process.env.VK_CLIENT_SECRET,
        callbackURL: redirectURI,
      },
      async ({ profile }) => {
        return {
          email: profile.emails[0].value,
          id: profile.id,
          username: profile.displayName,
          name: [profile.name.givenName, profile.name.givenName].join(' '),
          imageUrl: profile.photos[0].value,
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
    const code = 'MOCK_CODE_VK_KODY'
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
