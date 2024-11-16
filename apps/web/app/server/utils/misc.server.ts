import { ip as ipAddress } from 'address'

export const getHostAdress = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:' + process.env.WEB_PORT
  }

  if (process.env.HOST) {
    return process.env.HOST
  }

  const ip = ipAddress()
  return 'http://' + ip + ':' + process.env.WEB_PORT
}
