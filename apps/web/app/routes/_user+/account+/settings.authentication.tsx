import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { type VerificationType } from '../../auth+/verify/index.js'
import { useUser } from 'app/utils/user'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export const twoFAVerificationType = '2fa' satisfies VerificationType
export const twoFAVerifyVerificationType = '2fa-verify'

export default function AccoutSettingsAuthenticationRoute() {
  const data = useUser()

  return <div>fullname: {data.fullname}</div>
}
