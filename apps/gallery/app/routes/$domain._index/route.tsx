import { type LoaderFunctionArgs } from '@remix-run/node'
import React, { Suspense } from 'react'
import { prisma } from '../../server/db.server'
import { Await, useLoaderData } from '@remix-run/react'
import Stack from '@valley/ui/Stack'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const user = await prisma.user.findFirst({
    where: {
      settings: {
        serviceDomain: params.domain,
      },
    },
  })

  const projects = await prisma.project.findMany({
    where: {
      User: {
        settings: {
          serviceDomain: params.domain,
        },
      },
    },
  })

  return { user, projects }
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
