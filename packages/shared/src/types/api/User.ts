import type { User, UserSettings } from '@valley/db'

export type UserFull = User & {
  userSettings: UserSettings | null
}
