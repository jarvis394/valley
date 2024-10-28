import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { Outlet } from '@remix-run/react'
import { type VerificationType } from '../auth+/verify/index.jsx'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export const twoFAVerificationType = '2fa' satisfies VerificationType
export const twoFAVerifyVerificationType = '2fa-verify'

export default function AccoutSettingsAuthenticationRoute() {
  return <Outlet />
}
