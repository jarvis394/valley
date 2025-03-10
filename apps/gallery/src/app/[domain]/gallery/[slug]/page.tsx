import Wrapper from '@valley/ui/Wrapper'
import { notFound } from 'next/navigation'
import Button from '@valley/ui/Button'
import FolderGallery from '../../../../components/FolderGallery/FolderGallery'
import { db } from '@valley/db'
import { queryUserByDomain } from '../../../../server/user'

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
    <Wrapper className="flex flex-col gap-4 py-4">
      <h1 className="text-2xl font-medium">{project.title}</h1>
      {project.folders.map((folder, i) => (
        <Button variant="secondary" key={i}>
          {folder.title}
        </Button>
      ))}
      <div className="flex flex-col gap-4">
        {project.folders.map((folder) => (
          <FolderGallery key={folder.id} folder={folder} />
        ))}
      </div>
    </Wrapper>
  )
}
