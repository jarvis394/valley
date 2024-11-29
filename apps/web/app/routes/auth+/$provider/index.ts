import { redirect, type ActionFunctionArgs } from '@vercel/remix'
import { authenticator } from '../../../server/auth/auth.server'
import { handleMockAction } from '../../../server/auth/connections.server'
import { ProviderNameSchema } from '../../../config/connections'
import { getRedirectCookieHeader } from 'app/server/redirect-cookie.server'
import { getReferrerRoute } from 'app/utils/misc'

export const providerNameQueryKey = 'provider'

export async function loader() {
  return redirect('/auth/login')
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const providerName = ProviderNameSchema.parse(params.provider)
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
    return error
  }
}
