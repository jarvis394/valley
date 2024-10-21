import { type Strategy } from 'remix-auth'
import { type Timings } from '../timing.server'

// Define a user type for cleaner typing
export type ProviderUser = {
  id: string
  email: string
  username?: string
  name?: string
  imageUrl?: string
}

export interface AuthProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAuthStrategy(): Strategy<ProviderUser, any>
  handleMockAction(request: Request): Promise<void>
  resolveConnectionData(
    providerId: string,
    options?: { timings?: Timings }
  ): Promise<{
    displayName: string
    link?: string | null
  }>
}

export const normalizeEmail = (s: string) => s.trim().toLowerCase()

export const normalizeUsername = (s: string) =>
  // Only Latin letters and numbers
  s.replaceAll(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
