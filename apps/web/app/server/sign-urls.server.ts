import { invariant } from 'app/utils/invariant'
import crypto from 'node:crypto'

const makeSign = (payload: string) => {
  return crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(payload)
    .digest('hex')
}

export const signUrl = (
  url: string,
  searchParams: Record<string, string> = {},
  expiration: number | null = null
) => {
  const res = new URL(url)

  for (const key in searchParams) {
    res.searchParams.set(key, searchParams[key])
  }

  if (expiration) {
    invariant(!isNaN(expiration), 'Expiration time must be numeric')
    const expires = Math.round(Date.now() / 1000) + expiration * 60 * 60
    res.searchParams.set('expires', expires.toString())
  }

  res.searchParams.sort()
  res.searchParams.set('sign', makeSign(res.toString()))

  return res.toString()
}

export const isValidUrlSign = (url: string) => {
  const res = new URL(url)
  const signature = res.searchParams.get('sign')
  const expires = Number(res.searchParams.get('expires'))

  if (!expires || !signature) return false

  res.searchParams.delete('sign')

  return (
    signature === makeSign(res.toString()) &&
    Math.round(Date.now() / 1000) <= expires
  )
}
