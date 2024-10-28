import { redirect, type ActionFunctionArgs } from '@remix-run/node'
import { authenticator } from '../../../server/auth.server'
import { handleMockAction } from '../../../server/connections.server'
import { ProviderNameSchema } from '../../../config/connections'
import { getReferrerRoute } from '../../../utils/misc'
import { getRedirectCookieHeader } from '../../../server/redirect-cookie.server'

export async function loader() {
  return redirect('/login')
}

export async function action({ request, params }: ActionFunctionArgs) {
  const providerName = ProviderNameSchema.parse(params.provider)

  try {
    await handleMockAction(providerName, request)
    return await authenticator.authenticate(providerName, request)
  } catch (error: unknown) {
    if (error instanceof Response) {
      const formData = await request.formData()
      const rawRedirectTo = formData.get('redirectTo')
      const redirectTo =
        typeof rawRedirectTo === 'string'
          ? rawRedirectTo
          : getReferrerRoute(request)
      const redirectToCookie = getRedirectCookieHeader(redirectTo)
      if (redirectToCookie) {
        error.headers.append('set-cookie', redirectToCookie)
      }
    }
    throw error
  }
}
