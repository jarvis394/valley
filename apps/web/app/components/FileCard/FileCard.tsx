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
import { useRouteLoaderData, useSearchParams } from '@remix-run/react'
import { loader as rootLoader } from 'app/root'
import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import cx from 'classnames'

type FileCardMenuContentProps = {
  file: File
}

const FileCardMenuContent: React.FC<FileCardMenuContentProps> = ({ file }) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const handleFileDelete = () => {
    searchParams.set('modal', 'confirm-file-deletion')
    searchParams.set('modal-fileId', file.id.toString())
    setSearchParams(searchParams, {
      preventScrollReset: true,
    })
  }

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
      <Menu.Item
        onClick={handleFileDelete}
        before={<Trash color="var(--red-600)" />}
      >
        Delete
      </Menu.Item>
    </Menu.Content>
  )
}

type FileCardProps = {
  file: File
  isOverlay?: boolean
}

const FileCard: React.FC<FileCardProps> = ({ file, isOverlay, ...props }) => {
  const data = useRouteLoaderData<typeof rootLoader>('root')
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({ ...args, wasDragging: true })
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: file.id,
    animateLayoutChanges,
  })
  const fileThumbnailUrl =
    file.thumbnailKey &&
    data?.ENV.UPLOAD_SERVICE_URL + '/api/files/' + file.thumbnailKey
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDropdownOpenChange = (isOpen: boolean) => {
    setDropdownOpen(isOpen)
  }

  return (
    <Menu.Root
      openOnContextMenu
      dropdownMenuProps={{ onOpenChange: handleDropdownOpenChange }}
    >
      <li
        {...props}
        {...attributes}
        {...listeners}
        ref={setNodeRef}
        className={cx(styles.fileCard, {
          [styles['fileCard--dragging']]: isDragging,
          [styles['fileCard--overlay']]: isOverlay,
        })}
        style={style}
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
          <Menu.Trigger asChild>
            <IconButton size="sm" variant="secondary-dimmed">
              <MoreHorizontal />
            </IconButton>
          </Menu.Trigger>
        </Stack>

        <FileCardMenuContent file={file} />
      </li>
    </Menu.Root>
  )
}

export default FileCard
