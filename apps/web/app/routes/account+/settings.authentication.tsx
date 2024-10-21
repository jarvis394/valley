import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { Outlet } from '@remix-run/react'
import { type VerificationTypes } from '../auth+/_verify/verify.jsx'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export const twoFAVerificationType = '2fa' satisfies VerificationTypes
export const twoFAVerifyVerificationType = '2fa-verify'

export default function AccoutSettingsAuthenticationRoute() {
  return <Outlet />
}
