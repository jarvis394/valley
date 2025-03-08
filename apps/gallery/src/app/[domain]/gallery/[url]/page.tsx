import Wrapper from '@valley/ui/Wrapper'
import { prisma } from '../../../../server/db'
import { notFound } from 'next/navigation'
import Button from '@valley/ui/Button'
import FolderGallery from '../../../../components/FolderGallery/FolderGallery'

export default async function Gallery({
  params,
}: {
  params: Promise<{ domain: string; url: string }>
}) {
  const resolvedParams = await params
  const { domain, url } = resolvedParams
  const project = await prisma.project.findFirst({
    where: {
      url,
      User: {
        OR: [
          {
            domains: { has: domain },
          },
          {
            serviceDomain: domain,
          },
        ],
      },
    },
    include: {
      User: true,
      folders: {
        include: {
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
