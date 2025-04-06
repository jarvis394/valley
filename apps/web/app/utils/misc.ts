import { useFormAction, useNavigation, useRouteLoaderData } from 'react-router'
import type { HTMLFormMethod } from 'react-router'
import { loader as rootLoader } from 'app/root'
import prettyBytes from 'pretty-bytes'
import { useMemo } from 'react'
import * as z from 'zod'

export const useRootLoaderData = () => {
  const rootContext = useRouteLoaderData<typeof rootLoader>('root')
  return rootContext!
}

export function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  console.error('Unable to get error message for error', error)
  return 'Unknown Error'
}

export const map = (
  value: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => ((value - x1) * (y2 - x2)) / (y1 - x1) + x2

export const formatBytes = (n: number) => {
  return prettyBytes(n, {
    maximumFractionDigits: 2,
    space: true,
    locale: 'ru',
    binary: false,
  })
}

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get('X-Forwarded-Host') ??
    request.headers.get('host') ??
    new URL(request.url).host
  const protocol = request.headers.get('X-Forwarded-Proto') ?? 'http'
  return `${protocol}://${host}`
}

export function getReferrerRoute(request: Request) {
  const referrer =
    request.headers.get('referer') ??
    request.headers.get('referrer') ??
    request.referrer
  const domain = getDomainUrl(request)
  if (referrer?.startsWith(domain)) {
    return referrer.slice(domain.length)
  } else {
    return '/auth/login'
  }
}

/**
 * Merge multiple headers objects into one (uses set so headers are overridden)
 */
export function mergeHeaders(
  ...headers: Array<ResponseInit['headers'] | null | undefined>
) {
  const merged = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      merged.set(key, value)
    }
  }
  return merged
}

/**
 * Combine multiple header objects into one (uses append so headers are not overridden)
 */
export function combineHeaders(
  ...headers: Array<ResponseInit['headers'] | null | undefined>
) {
  const combined = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value)
    }
  }
  return combined
}

/**
 * Combine multiple response init objects into one (uses combineHeaders)
 */
export function combineResponseInits(
  ...responseInits: Array<ResponseInit | null | undefined>
) {
  let combined: ResponseInit = {}
  for (const responseInit of responseInits) {
    combined = {
      ...responseInit,
      headers: combineHeaders(combined.headers, responseInit?.headers),
    }
  }
  return combined
}

/**
 * Returns true if the current navigation is submitting the current route's
 * form. Defaults to the current route's form action and method POST.
 *
 * Defaults state to 'non-idle'
 *
 * NOTE: the default formAction will include query params, but the
 * navigation.formAction will not, so don't use the default formAction if you
 * want to know if a form is submitting without specific query params.
 */
export function useIsPending({
  formAction,
  formMethod = 'POST',
  state = 'non-idle',
}: {
  formAction?: string
  formMethod?: HTMLFormMethod
  state?: 'submitting' | 'loading' | 'non-idle'
} = {}) {
  const contextualFormAction = useFormAction()
  const navigation = useNavigation()
  const isPendingState = useMemo(
    () =>
      state === 'non-idle'
        ? navigation.state !== 'idle'
        : navigation.state === state,
    [navigation.state, state]
  )

  return (
    isPendingState &&
    navigation.formAction === (formAction ?? contextualFormAction) &&
    navigation.formMethod === formMethod
  )
}

/** Optional type that formats `''` to `undefined` for Zod schema */
export const looseOptional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value: unknown) =>
      value === null || (typeof value === 'string' && value === '')
        ? undefined
        : value,
    schema.optional()
  )

export const parseCookies = () => {
  return document.cookie
    .split(';')
    .map((v) => v.split('='))
    .reduce(
      (acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
        return acc
      },
      {} as Record<string, string>
    )
}

export const lowerFirstLetter = (s: string) => {
  return s[0].toLowerCase() + s.slice(1)
}

export const capitalizeFirstLetter = (s: string) => {
  return s[0].toUpperCase() + s.slice(1)
}

export const enumEntries = <T extends z.EnumLike>(t: T) => {
  const entries = Object.entries(t) as unknown as Array<[string, T[keyof T]]>
  const plainStringEnum = entries.every(
    ([_, value]) => typeof value === 'string'
  )
  return plainStringEnum
    ? entries
    : entries.filter(([_, v]) => typeof v !== 'string')
}

export const enumKeys = <T extends z.EnumLike>(
  t: T
): ReadonlyArray<keyof T> => {
  return enumEntries(t).map(([key]) => key)
}

export const enumValues = <T extends z.EnumLike>(
  t: T
): ReadonlyArray<T[keyof T]> => {
  const values = Object.values(t) as Array<T[keyof T]>
  const plainStringEnum = values.every((x) => typeof x === 'string')
  return plainStringEnum ? values : values.filter((x) => typeof x !== 'string')
}
