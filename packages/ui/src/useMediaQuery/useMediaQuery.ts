/**
 * Adapted from @mui/system/useMediaQuery
 * https://github.com/mui/material-ui/blob/master/packages/mui-system/src/useMediaQuery/useMediaQuery.ts
 */
import React, { useSyncExternalStore } from 'react'

export interface UseMediaQueryOptions {
  /**
   * As `window.matchMedia()` is unavailable on the server,
   * it returns a default matches during the first mount.
   * @default false
   */
  defaultMatches?: boolean
  /**
   * You can provide your own implementation of matchMedia.
   * This can be used for handling an iframe content window.
   */
  matchMedia?: typeof window.matchMedia
  /**
   * To perform the server-side hydration, the hook needs to render twice.
   * A first time with `defaultMatches`, the value of the server, and a second time with the resolved value.
   * This double pass rendering cycle comes with a drawback: it's slower.
   * You can set this option to `true` if you use the returned value **only** client-side.
   * @default false
   */
  noSsr?: boolean
  /**
   * You can provide your own implementation of `matchMedia`, it's used when rendering server-side.
   */
  ssrMatchMedia?: (query: string) => { matches: boolean }
}

const useMediaQueryNew = (
  query: string,
  defaultMatches: boolean,
  matchMedia: typeof window.matchMedia | null,
  ssrMatchMedia: ((query: string) => { matches: boolean }) | null,
  noSsr: boolean
): boolean => {
  const getDefaultSnapshot = React.useCallback(
    () => defaultMatches,
    [defaultMatches]
  )
  const getServerSnapshot = React.useMemo(() => {
    if (noSsr && matchMedia) {
      return () => matchMedia!(query).matches
    }

    if (ssrMatchMedia !== null) {
      const { matches } = ssrMatchMedia(query)
      return () => matches
    }
    return getDefaultSnapshot
  }, [getDefaultSnapshot, query, ssrMatchMedia, noSsr, matchMedia])
  const [getSnapshot, subscribe] = React.useMemo(() => {
    if (matchMedia === null) {
      return [getDefaultSnapshot, () => () => {}]
    }

    const mediaQueryList = matchMedia(query)

    return [
      () => mediaQueryList.matches,
      (notify: () => void) => {
        mediaQueryList.addEventListener('change', notify)
        return () => {
          mediaQueryList.removeEventListener('change', notify)
        }
      },
    ]
  }, [getDefaultSnapshot, matchMedia, query])
  const match = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return match
}

export default function useMediaQuery(
  queryInput: string,
  options: UseMediaQueryOptions = {}
): boolean {
  const supportMatchMedia =
    typeof window !== 'undefined' && typeof window.matchMedia !== 'undefined'

  const match = useMediaQueryNew(
    queryInput.replace(/^@media( ?)/m, ''),
    options.defaultMatches || false,
    supportMatchMedia ? window.matchMedia : null,
    options.ssrMatchMedia || null,
    options.noSsr || false
  )

  return match
}
