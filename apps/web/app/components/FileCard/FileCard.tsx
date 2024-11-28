import React, { useState } from 'react'
import styles from './FileCard.module.css'
import { File } from '@valley/db'
import * as DropdownMenu from '@valley/ui/DropdownMenu'
import * as ContextMenu from '@valley/ui/ContextMenu'
import Menu, { MenuProps } from '@valley/ui/Menu'
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
import MenuItem from '@valley/ui/MenuItem'
import MenuSeparator from '@valley/ui/MenuSeparator'
import IconButton from '@valley/ui/IconButton'
import { formatBytes } from '../../utils/misc'
import { useRouteLoaderData } from '@remix-run/react'
import { loader as rootLoader } from 'app/root'

type FileCardProps = {
  file: File
}

const MenuContent: React.FC<{
  type?: MenuProps['type']
  file: File
}> = ({ type = 'dropdown', file }) => {
  return (
    <Menu type={type}>
      <Stack
        gap={0.5}
        className={styles.fileCard__menuHeader}
        direction={'column'}
        padding={2}
      >
        <h6>{formatBytes(Number(file.size))}</h6>
        <p>{file.type}</p>
      </Stack>
      <MenuSeparator />
      <MenuItem before={<Footer color="var(--text-secondary)" />}>
        Set as folder cover
      </MenuItem>
      <MenuItem before={<Link color="var(--text-secondary)" />}>
        Copy link
      </MenuItem>
      <MenuItem before={<Download color="var(--text-secondary)" />}>
        Download
      </MenuItem>
      <MenuItem before={<MenuIcon color="var(--text-secondary)" />}>
        Reorder
      </MenuItem>
      <MenuItem before={<Information color="var(--text-secondary)" />}>
        Info
      </MenuItem>
      <MenuSeparator />
      <MenuItem before={<Trash color="var(--red-600)" />}>Delete</MenuItem>
    </Menu>
  )
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
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div className={styles.fileCard}>
          <DropdownMenu.Root
            modal={false}
            onOpenChange={handleDropdownOpenChange}
          >
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
              <DropdownMenu.Trigger asChild>
                <IconButton size="sm" variant="secondary-dimmed">
                  <MoreHorizontal />
                </IconButton>
              </DropdownMenu.Trigger>
            </Stack>

            <MenuContent type={'dropdown'} file={file} />
          </DropdownMenu.Root>
        </div>
      </ContextMenu.Trigger>
      <MenuContent type={'context'} file={file} />
    </ContextMenu.Root>
  )
}

export default FileCard
