import { api } from '../../api'
import {
  UserLoginReq,
  UserLoginRes,
  UserLogoutRes,
  UserRegisterReq,
  UserRegisterRes,
} from '@valley/shared'

async function registerUser(username: string, password: string) {
  const response = await api().post<void, UserRegisterRes, UserRegisterReq>(
    '/auth/register',
    {
      username,
      password,
    }
  )
  return response
}

async function autorizeUser(username: string, password: string) {
  const response = await api().post<void, UserLoginRes, UserLoginReq>(
    '/auth/login',
    {
      username,
      password,
    }
  )
  return response
}

async function logoutCurrentUser() {
  return (await api().get<UserLogoutRes>('/auth/logout')).data
}

export { registerUser, autorizeUser, logoutCurrentUser }
