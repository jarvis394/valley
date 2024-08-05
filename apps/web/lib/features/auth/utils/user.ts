import { api } from '../../api'
import {
  UserLoginReq,
  UserLoginRes,
  UserRegisterReq,
  UserRegisterRes,
} from '@valley/shared'
import { AxiosResponse } from 'axios'

async function registerUser(username: string, password: string) {
  const response = await api().post<
    void,
    AxiosResponse<UserRegisterRes>,
    UserRegisterReq
  >('/auth/register', {
    username,
    password,
  })
  return response.data
}

async function autorizeUser(username: string, password: string) {
  const response = await api().post<
    void,
    AxiosResponse<UserLoginRes>,
    UserLoginReq
  >('/auth/login', {
    username,
    password,
  })
  return response.data
}

export { registerUser, autorizeUser }
