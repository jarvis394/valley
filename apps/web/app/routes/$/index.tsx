import React from 'react'
import { Link, useLocation } from '@remix-run/react'
import Button from '@valley/ui/Button'
import { GeneralErrorBoundary } from '../../components/ErrorBoundary'
import styles from './ErrorBoundaryPage.module.css'
import Stack from '@valley/ui/Stack'

export const runtime = 'edge'

export async function loader() {
  throw new Response('Not found', { status: 404 })
}

export async function action() {
  throw new Response('Not found', { status: 404 })
}

export default function NotFound() {
  return <ErrorBoundary />
}

export function ErrorBoundary() {
  const location = useLocation()
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <Stack
            align={'center'}
            justify={'center'}
            direction={'column'}
            padding={2}
            gap={6}
          >
            <Stack
              align={'center'}
              justify={'center'}
              direction={'column'}
              gap={2}
              className={styles.ErrorBoundaryPage__content}
            >
              <h1>We can&apos;t find this page:</h1>
              <pre>{location.pathname}</pre>
            </Stack>
            <Button size="lg" asChild>
              <Link to="/" className={styles.ErrorBoundaryPage__link}>
                Back to home
              </Link>
            </Button>
          </Stack>
        ),
      }}
    />
  )
}
