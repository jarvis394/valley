import { User } from '@prisma/client'
import { SerializedUser } from '../SerializedUser'

export type UserGetSelfReq = unknown
export type UserGetSelfRes = { user: SerializedUser | null }

export type Tokens = { accessToken: string; refreshToken: string }
export type UserLoginReq = { email: string; password: string }
export type UserLoginRes = { user: SerializedUser; tokens: Tokens }

export type UserRegisterReq = Omit<User, 'id' | 'devices'>
export type UserRegisterRes = { user: SerializedUser; tokens: Tokens }
