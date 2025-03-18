import {
  emailOTPClient,
  magicLinkClient,
  passkeyClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { showToast } from '@valley/ui/Toast'

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), magicLinkClient(), passkeyClient()],
  fetchOptions: {
    onError: (ctx) => {
      showToast({
        type: 'error',
        id: 'auth-error',
        description: ctx.error.message,
        title: ctx.error.name,
      })
    },
  },
})
