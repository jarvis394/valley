import React, { useState } from 'react'
import styles from './FileCard.module.css'
import { File } from '@valley/db'
import * as Menu from '@valley/ui/Menu'
import {
  Download,
  MoreHorizontal,
  PencilEdit,
  Trash,
  Menu as MenuIcon,
  Link,
  Footer,
  Information,
} from 'geist-ui-icons'
import Stack from '@valley/ui/Stack'
import IconButton from '@valley/ui/IconButton'
import { formatBytes } from '../../utils/misc'
import { useRouteLoaderData } from '@remix-run/react'
import { loader as rootLoader } from 'app/root'

type FileCardMenuContentProps = {
  file: File
}

const FileCardMenuContent: React.FC<FileCardMenuContentProps> = ({ file }) => {
  return (
    <Menu.Content>
      <Stack
        gap={0.5}
        className={styles.fileCard__menuHeader}
        direction={'column'}
        padding={2}
      >
        <h6>{formatBytes(Number(file.size))}</h6>
        <p>{file.type}</p>
      </Stack>
      <Menu.Separator />
      <Menu.Item before={<Footer color="var(--text-secondary)" />}>
        Set as folder cover
      </Menu.Item>
      <Menu.Item before={<Link color="var(--text-secondary)" />}>
        Copy link
      </Menu.Item>
      <Menu.Item before={<Download color="var(--text-secondary)" />}>
        Download
      </Menu.Item>
      <Menu.Item before={<MenuIcon color="var(--text-secondary)" />}>
        Reorder
      </Menu.Item>
      <Menu.Item before={<Information color="var(--text-secondary)" />}>
        Info
      </Menu.Item>
      <Menu.Separator />
      <Menu.Item before={<Trash color="var(--red-600)" />}>Delete</Menu.Item>
    </Menu.Content>
  )
}

type FileCardProps = {
  file: File
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const data = useRouteLoaderData<typeof rootLoader>('root')
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const handleDropdownOpenChange = (isOpen: boolean) => {
    setDropdownOpen(isOpen)
  }
  const fileThumbnailUrl =
    file.thumbnailKey &&
    data?.ENV.UPLOAD_SERVICE_URL + '/api/files/' + file.thumbnailKey

  return (
    <Menu.Root
      openOnContextMenu
      dropdownMenuProps={{ onOpenChange: handleDropdownOpenChange }}
    >
      <div className={styles.fileCard}>
        <div className={styles.fileCard__imageContainer}>
          {fileThumbnailUrl && (
            <img
              className={styles.fileCard__image}
              src={fileThumbnailUrl}
              alt={file.name}
            />
          )}
        </div>
        <p className={styles.fileCard__name}>{file.name}</p>

        <Stack
          className={styles.fileCard__toolbar}
          gap={2}
          align={'center'}
          data-menu-open={isDropdownOpen}
        >
          <IconButton size="sm" variant="secondary-dimmed">
            <PencilEdit />
          </IconButton>
          <Menu.Trigger asChild>
            <IconButton size="sm" variant="secondary-dimmed">
              <MoreHorizontal />
            </IconButton>
          </Menu.Trigger>
        </Stack>

        <FileCardMenuContent file={file} />
      </div>
    </Menu.Root>
  )
}

export default FileCard
