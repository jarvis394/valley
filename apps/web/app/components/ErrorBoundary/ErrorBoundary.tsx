import React, { JSX } from 'react'
import {
  type ErrorResponse,
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from 'react-router'
import { getErrorMessage } from '../../utils/misc'
import styles from './ErrorBoundary.module.css'
import Stack from '@valley/ui/Stack'

import '../../styles/fonts.css'
import '../../styles/global.css'
import '@valley/ui/styles/theme.css'
import '@valley/ui/styles/reset.css'
import '@valley/ui/styles/global.css'

type StatusHandler = (info: {
  error: ErrorResponse
  params: Record<string, string | undefined>
}) => JSX.Element | null

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  statusHandlers,
  unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: {
  defaultStatusHandler?: StatusHandler
  statusHandlers?: Record<number, StatusHandler>
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null
}) {
  const error = useRouteError()
  const params = useParams()

  if (typeof document !== 'undefined') {
    console.error(error)
  }

  return (
    <Stack
      align={'center'}
      justify={'center'}
      direction={'column'}
      padding={4}
      className={styles.ErrorBoundary}
    >
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </Stack>
  )
}
