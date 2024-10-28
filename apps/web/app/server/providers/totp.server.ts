import { User } from '@valley/db'
import { sendAuthEmail } from '../email.server'
import { getUserByEmail } from '../user.server'
import { AuthProvider } from './provider'
import { TOTPStrategy } from 'remix-auth-totp'
import { connectionSessionStorage } from '../connections.server'
import { createId as cuid } from '@paralleldrive/cuid2'
import { redirect } from '@remix-run/node'

const shouldMock =
  process.env.RESEND_API_KEY?.startsWith('MOCK_') ||
  process.env.NODE_ENV === 'test'

export class TOTPProvider implements AuthProvider {
  getAuthStrategy() {
    return new TOTPStrategy<User>(
      {
        sendTOTP: sendAuthEmail,
        secret: process.env.MAGIC_LINK_SECRET,
        magicLinkPath: '/verify/magic-link',
        totpGeneration: { charSet: '0123456789' },
      },
      async ({ email }) => {
        const user = await getUserByEmail(email)
        if (!user) throw new Error('User not found')
        return user
      }
    )
  }

  async handleMockAction(request: Request): Promise<void> {
    if (!shouldMock) return

    const connectionSession = await connectionSessionStorage.getSession(
      request.headers.get('cookie')
    )
    const state = cuid()
    connectionSession.set('oauth2:state', state)

    throw redirect('/auth/email/callback', {
      headers: {
        'set-cookie':
          await connectionSessionStorage.commitSession(connectionSession),
      },
    })
  }

  resolveConnectionData(): Promise<{
    displayName: string
    link?: string | null
  }> {
    throw new Error('totp: resolveConnectionData should not be called')
  }
}
