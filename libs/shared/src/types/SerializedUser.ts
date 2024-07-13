import { User } from '@prisma/client'

export type SerializedUser = Omit<User, 'password' | 'refreshToken'>
