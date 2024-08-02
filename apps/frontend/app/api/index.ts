import { API_URL } from '@app/config/constants'
import axios, { AxiosInstance, AxiosStatic } from 'axios'
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry'
import { getAuthTokens } from '@lib/features/auth/utils/access-token'

type ApiProps = {
  isAccessTokenRequired?: boolean
}

const api = ({ isAccessTokenRequired }: ApiProps = {}) => {
  const tokens = getAuthTokens()

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(tokens && { Authorization: `Bearer ${tokens.accessToken}` }),
    },
  })

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (isAccessTokenRequired && error?.response?.status === 401) {
        window.location.href = '/auth/login'
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
    return !(error.response?.status === 404)
  },
  retryDelay: axiosRetry.exponentialDelay,
}

const connectRequestRepeater = (client: AxiosStatic | AxiosInstance) => {
  axiosRetry(client, requestRepeaterConfig)
}

export { api, connectRequestRepeater }
