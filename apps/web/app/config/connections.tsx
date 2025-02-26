import { z } from 'zod'
import { LogoGithub, LogoGoogle } from 'geist-ui-icons'
import LogoVK from '../components/svg/LogoVK'

export const GITHUB_PROVIDER_NAME = 'github'
export const GOOGLE_PROVIDER_NAME = 'google'
export const VK_PROVIDER_NAME = 'vk'

export const PROVIDER_NAMES = [
  GOOGLE_PROVIDER_NAME,
  GITHUB_PROVIDER_NAME,
  VK_PROVIDER_NAME,
] as const
export const ProviderNameSchema = z.enum(PROVIDER_NAMES)
export type ProviderName = z.infer<typeof ProviderNameSchema>

export const PROVIDER_LABELS: Record<ProviderName, string> = {
  [GITHUB_PROVIDER_NAME]: 'GitHub',
  [GOOGLE_PROVIDER_NAME]: 'Google',
  [VK_PROVIDER_NAME]: 'VK',
} as const

export const PROVIDER_ICONS: Record<ProviderName, React.ReactNode> = {
  [GITHUB_PROVIDER_NAME]: <LogoGithub />,
  [GOOGLE_PROVIDER_NAME]: <LogoGoogle className="svg-own-color" />,
  [VK_PROVIDER_NAME]: <LogoVK />,
} as const

export const PROVIDER_MANAGE_LINKS: Record<ProviderName, string> = {
  [GITHUB_PROVIDER_NAME]:
    'https://github.com/settings/connections/applications/' +
    import.meta.env.VITE_GITHUB_CLIENT_ID,
  [GOOGLE_PROVIDER_NAME]: 'https://myaccount.google.com/connections',
  [VK_PROVIDER_NAME]: 'https://id.vk.com/account/#/services',
} as const

export const PROVIDER_WEBSITES: Record<ProviderName, string> = {
  [GITHUB_PROVIDER_NAME]: 'github.com',
  [GOOGLE_PROVIDER_NAME]: 'myaccount.google.com',
  [VK_PROVIDER_NAME]: 'id.vk.com',
} as const
