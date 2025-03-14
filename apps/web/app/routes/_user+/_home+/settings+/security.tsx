import { useLoaderData } from '@remix-run/react'
import { ShouldRevalidateFunction } from '@remix-run/router'
import Stack from '@valley/ui/Stack'
import React from 'react'
import Paper from '@valley/ui/Paper'
import { loader as authLoader } from './auth'

export const loader = authLoader

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return true
}

const SecurityPage = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <Stack padding={4} direction={'column'} asChild>
      <Paper variant="secondary" rounded>
        Password
      </Paper>
    </Stack>
  )
}

export default SecurityPage
