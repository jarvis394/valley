import { createId as cuid } from '@paralleldrive/cuid2'
import { redirect } from '@remix-run/cloudflare'
import { GitHubStrategy } from 'remix-auth-github'
import { z } from 'zod'
import { redisCache, cachified } from '../../cache'
import { connectionSessionStorage } from '../connections.server'
import { type Timings } from '../../timing.server'
import { normalizeEmail, type AuthProvider } from './provider'
import { getHostAdress } from '../../../server/utils/misc.server'

export const MOCK_CODE_GITHUB = 'MOCK_CODE_GITHUB_KODY'
export const MOCK_CODE_GITHUB_HEADER = 'x-mock-code-github'

const GitHubUserSchema = z.object({ login: z.string() })
const GitHubUserParseResult = z
  .object({
    success: z.literal(true),
    data: GitHubUserSchema,
  })
  .or(
    z.object({
      success: z.literal(false),
    })
  )

const shouldMock =
  process.env.GITHUB_CLIENT_ID?.startsWith('MOCK_') ||
  process.env.NODE_ENV === 'test'
const redirectURI = getHostAdress() + '/auth/github/callback'

export class GitHubProvider implements AuthProvider {
  getAuthStrategy() {
    return new GitHubStrategy(
      {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectURI,
      },
      async ({ profile }) => {
        const email = normalizeEmail(profile.emails[0]?.value)
        if (!email) {
          throw new Error('Email not found')
        }
        const username = profile.displayName
        const imageUrl = profile.photos[0].value
        return {
          email,
          id: profile.id,
          username,
          name: profile.name.givenName,
          imageUrl,
        }
      }
    )
  }

  async resolveConnectionData(
    providerId: string,
    { timings }: { timings?: Timings } = {}
  ) {
    const result = await cachified({
      key: `connection-data:github:${providerId}`,
      cache: redisCache,
      timings,
      ttl: 1000 * 60,
      swr: 1000 * 60 * 60 * 24 * 7,
      async getFreshValue(context) {
        const response = await fetch(
          `https://api.github.com/user/${providerId}`,
          { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
        )
        const rawJson = await response.json()
        const result = GitHubUserSchema.safeParse(rawJson)
        if (!result.success) {
          // if it was unsuccessful, then we should kick it out of the cache
          // asap and try again.
          context.metadata.ttl = 0
        }

        return result
      },
      checkValue: GitHubUserParseResult,
    })

    return {
      displayName: result.success ? result.data.login : '',
      link: result.success ? `https://github.com/${result.data.login}` : null,
    } as const
  }

  async handleMockAction(request: Request) {
    if (!shouldMock) return

    const connectionSession = await connectionSessionStorage.getSession(
      request.headers.get('cookie')
    )
    const state = cuid()
    connectionSession.set('oauth2:state', state)

    // allows us to inject a code when running e2e tests,
    // but falls back to a pre-defined constant
    const code =
      request.headers.get(MOCK_CODE_GITHUB_HEADER) || MOCK_CODE_GITHUB
    const searchParams = new URLSearchParams({ code, state })
    throw redirect(`/auth/github/callback?${searchParams}`, {
      headers: {
        'set-cookie': await connectionSessionStorage.commitSession(
          connectionSession
        ),
      },
    })
  }
}
