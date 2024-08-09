import { User } from '@valley/db'

export type SerializedUser = Omit<User, 'password' | 'refreshToken'>
