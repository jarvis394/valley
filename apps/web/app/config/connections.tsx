import { z } from 'zod'
import { LogoGithub, LogoGoogle } from 'geist-ui-icons'
import LogoVK from '../components/svg/LogoVK'

export const GITHUB_PROVIDER_NAME = 'github'
export const GOOGLE_PROVIDER_NAME = 'google'
export const VK_PROVIDER_NAME = 'vk'

export const PROVIDER_NAMES = [
  GITHUB_PROVIDER_NAME,
  // GOOGLE_PROVIDER_NAME,
  // VK_PROVIDER_NAME,
] as const
export const ProviderNameSchema = z.enum(PROVIDER_NAMES)
export type ProviderName = z.infer<typeof ProviderNameSchema>

export const PROVIDER_LABELS: Record<ProviderName, string> = {
  [GITHUB_PROVIDER_NAME]: 'GitHub',
  // [GOOGLE_PROVIDER_NAME]: 'Google',
  // [VK_PROVIDER_NAME]: 'VK',
} as const

export const PROVIDER_ICONS: Record<ProviderName, React.ReactNode> = {
  [GITHUB_PROVIDER_NAME]: <LogoGithub />,
  // [GOOGLE_PROVIDER_NAME]: <LogoGoogle className="svg-own-color" />,
  // [VK_PROVIDER_NAME]: <LogoVK />,
} as const
