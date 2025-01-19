import type { User } from '@valley/db'
import { SerializedUser } from '../SerializedUser.js'

export type UserGetSelfReq = unknown
export type UserGetSelfRes = { user: SerializedUser | null }

export type Tokens = { accessToken: string; refreshToken: string }
export type UserLoginReq = { username: string; password: string }
export type UserLoginRes = { user: SerializedUser; tokens: Tokens }

export type UserRegisterReq = Omit<User, 'id' | 'refreshToken'>
export type UserRegisterRes = { user: SerializedUser; tokens: Tokens }

export type UserLogoutReq = unknown
export type UserLogoutRes = { ok: boolean }
