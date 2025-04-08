import type { User, UserSettings, File } from '@valley/db'

export type UserFull = User & {
  userSettings: UserSettings | null
  avatar?: File | null
}
