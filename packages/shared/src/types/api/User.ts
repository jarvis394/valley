import type { User, UserSettings } from '@valley/db'

export type UserFull = User & {
  settings: UserSettings | null
}
