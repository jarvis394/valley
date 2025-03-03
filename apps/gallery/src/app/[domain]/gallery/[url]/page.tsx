import Wrapper from '@valley/ui/Wrapper'
import { prisma } from '../../../../server/db'
import { notFound } from 'next/navigation'
import Button from '@valley/ui/Button'
import { UPLOAD_SERVICE_URL } from '../../../../config/constants'
import { RowsPhotoAlbum } from 'react-photo-album'

export default async function Home({
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
      {project.folders.map((folder) => (
        <Button variant="tertiary" key={folder.id}>
          {folder.title}
        </Button>
      ))}
      <div className="flex flex-col gap-4">
        {project.folders.map((folder) => (
          <div key={folder.id + '_grid'} className="flex flex-col gap-4">
            <h3 className="text-lg text-medium">{folder.title}</h3>
            <RowsPhotoAlbum
              photos={folder.files.map((file) => ({
                src: UPLOAD_SERVICE_URL + '/api/files/' + file.key,
                width: 100,
                height: 100,
              }))}
            />
          </div>
        ))}
      </div>
    </Wrapper>
  )
}
