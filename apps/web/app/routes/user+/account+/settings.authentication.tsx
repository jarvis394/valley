import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { type VerificationType } from '../../auth+/verify'
import { useUserAwait } from 'app/utils/user'
import { Suspense } from 'react'
import { Await, Link } from '@remix-run/react'
import Stack from '@valley/ui/Stack'
import Button from '@valley/ui/Button'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export const twoFAVerificationType = '2fa' satisfies VerificationType
export const twoFAVerifyVerificationType = '2fa-verify'

export default function AccoutSettingsAuthenticationRoute() {
  const user = useUserAwait()

  return (
    <Stack direction={'column'} gap={4}>
      <Button asChild>
        <Link to="..">back</Link>
      </Button>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Await errorElement={<>error</>} resolve={user}>
          {(user) => <div>fullname: {user?.fullname}</div>}
        </Await>
      </Suspense>
    </Stack>
  )
}
