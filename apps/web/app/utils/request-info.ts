import { invariant } from './invariant'
import { useRootLoaderData } from './misc'

/**
 * @returns the request info from the root loader (throws an error if it does not exist)
 */
export function useRequestInfo() {
  const maybeRequestInfo = useOptionalRequestInfo()
  invariant(maybeRequestInfo, 'No requestInfo found in root loader')
  return maybeRequestInfo
}

export function useOptionalRequestInfo() {
  const data = useRootLoaderData()
  return data?.requestInfo
}
