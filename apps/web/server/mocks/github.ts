import { faker } from '@faker-js/faker'
import { HttpResponse, passthrough, http, type HttpHandler } from 'msw'

const { json } = HttpResponse

function createGitHubUser(code?: string | null) {
  const createEmail = () => ({
    email: faker.internet.email(),
    verified: faker.datatype.boolean(),
    primary: false, // <-- can only have one of these
    visibility: faker.helpers.arrayElement(['public', null]),
  })
  const primaryEmail = {
    ...createEmail(),
    verified: true,
    primary: true,
  }

  const emails = [
    {
      email: faker.internet.email(),
      verified: false,
      primary: false,
      visibility: 'public',
    },
    {
      email: faker.internet.email(),
      verified: true,
      primary: false,
      visibility: null,
    },
    primaryEmail,
  ]

  code ??= faker.string.uuid()
  return {
    code,
    accessToken: `${code}_mock_access_token`,
    profile: {
      login: faker.internet.username(),
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      avatar_url: 'https://github.com/ghost.png',
      emails: emails.map((e) => e.email),
    },
    emails,
    primaryEmail: primaryEmail.email,
  }
}

export type GitHubUser = ReturnType<typeof createGitHubUser>

const passthroughGitHub =
  !process.env.GITHUB_CLIENT_ID?.startsWith('MOCK_') &&
  process.env.NODE_ENV !== 'test'

export const handlers: HttpHandler[] = [
  http.post(
    'https://github.com/login/oauth/access_token',
    async ({ request }) => {
      if (passthroughGitHub) return passthrough()
      const params = new URLSearchParams(await request.text())

      const code = params.get('code')
      const user = createGitHubUser(code)

      return new Response(
        JSON.stringify({
          access_token: user.accessToken,
          token_type: '__MOCK_TOKEN_TYPE__',
        }),
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
      )
    }
  ),
  http.get('https://api.github.com/user/emails', async () => {
    if (passthroughGitHub) return passthrough()

    const user = createGitHubUser()
    if (user instanceof Response) return user

    return json(user.emails)
  }),
  http.get('https://api.github.com/user/:id', async () => {
    if (passthroughGitHub) return passthrough()

    const mockUser = createGitHubUser()
    if (mockUser) return json(mockUser.profile)

    return new Response('Not Found', { status: 404 })
  }),
  http.get('https://api.github.com/user', async () => {
    if (passthroughGitHub) return passthrough()

    const user = createGitHubUser()
    if (user instanceof Response) return user

    return json(user.profile)
  }),
  http.get('https://github.com/ghost.png', async () => {
    passthrough()
  }),
]
