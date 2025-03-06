import Wrapper from '@valley/ui/Wrapper'
import { prisma } from '../../../../server/db'
import { notFound } from 'next/navigation'
import Button from '@valley/ui/Button'
import { WEB_SERVICE_URL } from '../../../../config/constants'
import { RowsPhotoAlbum, type Photo } from 'react-photo-album'
import { FolderWithFiles } from '@valley/shared'
import { getFileThumbnailQuery } from '@valley/ui/utils/getFileThumbnailQuery'

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

  const getPhotos = (folder: FolderWithFiles): Photo[] => {
    return folder.files.map((file) => ({
      src:
        WEB_SERVICE_URL +
        '/api/files/' +
        file.key +
        '?' +
        getFileThumbnailQuery({ size: 'lg', file }),
      width: file.width || 2,
      height: file.height || 3,
      title: file.id,
    }))
  }

  return (
    <Wrapper className="flex flex-col gap-4 py-4">
      <h1 className="text-2xl font-medium">{project.title}</h1>
      {project.folders.map((folder) => (
        <Button variant="secondary" key={folder.id}>
          {folder.title}
        </Button>
      ))}
      <div className="flex flex-col gap-4">
        {project.folders.map((folder) => (
          <div key={folder.id + '_grid'} className="flex flex-col gap-4">
            <h3 className="text-lg text-medium">{folder.title}</h3>
            <RowsPhotoAlbum
              componentsProps={{
                image: {
                  crossOrigin: 'anonymous',
                },
              }}
              spacing={8}
              photos={getPhotos(folder)}
            />
          </div>
        ))}
      </div>
    </Wrapper>
  )
}
