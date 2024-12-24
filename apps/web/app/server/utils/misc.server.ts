export const getHostAdress = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:' + process.env.WEB_PORT
  }

  return process.env.HOST
}

export const randomString = (length: number) => {
  const chars: string = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let res: string = ''

  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return res
}
