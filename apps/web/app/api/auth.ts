import { api } from '.'
import {
  UserLoginReq,
  UserLoginRes,
  UserLogoutRes,
  UserRegisterReq,
  UserRegisterRes,
} from '@valley/shared'

export const registerUser = async (username: string, password: string) => {
  const response = await api().post<void, UserRegisterRes, UserRegisterReq>(
    '/auth/register',
    {
      username,
      password,
    }
  )
  return response
}

export const authorizeUser = async (username: string, password: string) => {
  const response = await api().post<void, UserLoginRes, UserLoginReq>(
    '/auth/login',
    {
      username,
      password,
    }
  )
  return response
}

export const logoutCurrentUser = async () => {
  return (await api().get<UserLogoutRes>('/auth/logout')).data
}
