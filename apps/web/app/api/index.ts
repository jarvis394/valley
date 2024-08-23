import { API_URL } from '../config/constants'
import axios, { AxiosInstance, AxiosStatic } from 'axios'
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry'
import {
  getAuthTokens,
  setAuthTokensToLocalStorage,
} from '../utils/accessToken'
import { jwtDecode } from 'jwt-decode'
import { Tokens } from '@valley/shared'

type ApiProps = {
  isAccessTokenRequired?: boolean
}

const api = ({ isAccessTokenRequired }: ApiProps = {}) => {
  const tokens = getAuthTokens()

  const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      ...(tokens && { Authorization: `Bearer ${tokens.accessToken}` }),
    },
  })

  axiosInstance.interceptors.request.use(async (config) => {
    if (!isAccessTokenRequired) return config
    if (!tokens) return config

    config.headers.Authorization = `Bearer ${tokens.accessToken}`

    try {
      const tokenData = jwtDecode(tokens.accessToken)

      if (tokenData.exp && tokenData.exp * 1000 <= Date.now()) {
        const { data } = await axios.get<Tokens>(API_URL + '/auth/refresh', {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${tokens.refreshToken}`,
          },
        })

        console.log('Refreshed tokens:', data)

        setAuthTokensToLocalStorage(data)
        config.headers.Authorization = `Bearer ${data.accessToken}`
      }
    } catch (e) {
      return config
    }

    return config
  })

  axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (isAccessTokenRequired && error?.response?.status === 401) {
        axios
          .get<Tokens>(API_URL + '/auth/logout', {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${tokens?.refreshToken}`,
            },
          })
          .then(() => {
            window.location.href = '/auth/login'
          })
      } else {
        Promise.reject(error)
      }
    }
  )

  return axiosInstance
}

const requestRepeaterConfig: IAxiosRetryConfig = {
  retries: 5,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    if (error.response?.status === 401) return false
    return !(error.response?.status === 404)
  },
  retryDelay: axiosRetry.exponentialDelay,
}

const connectRequestRepeater = (client: AxiosStatic | AxiosInstance) => {
  axiosRetry(client, requestRepeaterConfig)
}

export { api, connectRequestRepeater }
