import { z } from 'zod'
import { LogoGithub, LogoGoogle } from 'geist-ui-icons'
import LogoVK from '../components/svg/LogoVK'
import Passkey from 'app/components/svg/Passkey'

export const GITHUB_PROVIDER_NAME = 'github'
export const GOOGLE_PROVIDER_NAME = 'google'
export const VK_PROVIDER_NAME = 'vk'
export const CREDENTIAL_PROVIDER_NAME = 'credential'

export const SOCIAL_PROVIDER_NAMES = [
  GOOGLE_PROVIDER_NAME,
  GITHUB_PROVIDER_NAME,
  VK_PROVIDER_NAME,
] as const
export const ProviderNameSchema = z.enum([
  ...SOCIAL_PROVIDER_NAMES,
  CREDENTIAL_PROVIDER_NAME,
])
export type ProviderName = z.infer<typeof ProviderNameSchema>
export type SocialProviderName = Exclude<
  ProviderName,
  typeof CREDENTIAL_PROVIDER_NAME
>

export const PROVIDER_LABELS: Record<ProviderName, string> = {
  [GITHUB_PROVIDER_NAME]: 'GitHub',
  [GOOGLE_PROVIDER_NAME]: 'Google',
  [VK_PROVIDER_NAME]: 'VK',
  [CREDENTIAL_PROVIDER_NAME]: 'Password',
} as const

export const PROVIDER_ICONS: Record<ProviderName, React.ReactNode> = {
  [GITHUB_PROVIDER_NAME]: <LogoGithub />,
  [GOOGLE_PROVIDER_NAME]: <LogoGoogle className="svg-own-color" />,
  [VK_PROVIDER_NAME]: <LogoVK />,
  [CREDENTIAL_PROVIDER_NAME]: <Passkey color="var(--text-secondary)" />,
} as const

export const PROVIDER_MANAGE_LINKS: Record<SocialProviderName, string> = {
  [GITHUB_PROVIDER_NAME]:
    'https://github.com/settings/connections/applications/' +
    import.meta.env.VITE_GITHUB_CLIENT_ID,
  [GOOGLE_PROVIDER_NAME]: 'https://myaccount.google.com/connections',
  [VK_PROVIDER_NAME]: 'https://id.vk.com/account/#/services',
} as const

export const PROVIDER_WEBSITES: Record<SocialProviderName, string> = {
  [GITHUB_PROVIDER_NAME]: 'github.com',
  [GOOGLE_PROVIDER_NAME]: 'myaccount.google.com',
  [VK_PROVIDER_NAME]: 'id.vk.com',
} as const
