import { defer, type LoaderFunctionArgs } from '@remix-run/node'
import React, { Suspense } from 'react'
import { prisma } from '../../server/db.server'
import { Await, useLoaderData } from '@remix-run/react'
import Stack from '@valley/ui/Stack'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const user = new Promise((res) => setTimeout(res, 2000)).then(() =>
    prisma.user.findFirst({
      where: {
        settings: {
          domain: params.domain,
        },
      },
    })
  )
  const projects = new Promise((res) => setTimeout(res, 4000)).then(() =>
    prisma.project.findMany({
      where: {
        User: {
          settings: {
            domain: params.domain,
          },
        },
      },
    })
  )

  return defer({ user, projects })
}

export default function UserPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <Stack direction={'column'} gap={4} padding={4}>
      <Suspense fallback={<div>Loading user...</div>}>
        <Await resolve={data.user}>
          {(user) => <div>User ID: {user?.id}</div>}
        </Await>
      </Suspense>
      <Suspense fallback={<div>Loading projects...</div>}>
        <Await resolve={data.projects}>
          {(projects) => <div>Projects length: {projects.length}</div>}
        </Await>
      </Suspense>
    </Stack>
  )
}
