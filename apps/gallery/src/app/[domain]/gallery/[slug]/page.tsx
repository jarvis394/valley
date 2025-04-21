import { notFound } from 'next/navigation'
import { db } from '@valley/db'
import { queryUserByDomain } from '../../../../server/user'
import ProjectGallery from '../../../../components/ProjectGallery/ProjectGallery'
import Head from 'next/head'

export default async function Gallery({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>
}) {
  const resolvedParams = await params
  const { domain, slug } = resolvedParams
  const project = await db.query.projects.findFirst({
    where: (projects, { eq, and }) =>
      and(queryUserByDomain(domain), eq(projects.slug, slug)),
    with: {
      user: {
        columns: {
          serviceDomain: true,
          domains: true,
          name: true,
          image: true,
        },
        with: {
          avatar: true,
        },
      },
      cover: {
        with: {
          file: true,
        },
      },
      folders: {
        with: {
          files: true,
        },
      },
    },
  })

  if (!project) {
    return notFound()
  }

  return (
    <>
      <Head>
        <title>{project.title} | Valley</title>
      </Head>
      <ProjectGallery project={project} />
    </>
  )
}
