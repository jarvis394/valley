import React, { useState } from 'react'
import styles from './FileCard.module.css'
import type { File } from '@valley/db'
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
  File as FileIcon,
} from 'geist-ui-icons'
import Stack from '@valley/ui/Stack'
import IconButton from '@valley/ui/IconButton'
import { formatBytes } from '../../utils/misc'
import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import cx from 'classnames'
import { useModal } from 'app/hooks/useModal'
import Paper from '@valley/ui/Paper'
import Image from '@valley/ui/Image'

type FileCardMenuContentProps = {
  file: File
}

const FileCardMenuContent: React.FC<FileCardMenuContentProps> = ({ file }) => {
  const { openModal } = useModal()

  const handleFileDelete = () => {
    openModal('confirm-file-deletion', {
      fileId: file.id,
    })
  }

  const handleSetCover = () => {
    openModal('set-project-cover', {
      fileId: file.id,
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
      <Menu.Item
        onClick={handleSetCover}
        before={<Footer color="var(--text-secondary)" />}
      >
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
  isCover?: boolean
  isOverlay?: boolean
}

const FileCard: React.FC<FileCardProps> = ({
  file,
  isOverlay,
  isCover,
  ...props
}) => {
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
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDropdownOpenChange = (isOpen: boolean) => {
    setDropdownOpen(isOpen)
  }

  return (
    <Menu.Root openOnContextMenu onOpenChange={handleDropdownOpenChange}>
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
          {file.canHaveThumbnails && (
            <Image
              className={styles.fileCard__image}
              file={file}
              thumbnail="sm"
            />
          )}
          {!file.canHaveThumbnails && <FileIcon width={32} height={32} />}
        </div>
        <p className={styles.fileCard__name}>{file.name}</p>

        {isCover && (
          <Stack
            className={styles.fileCard__coverBadge}
            gap={2}
            direction={'row'}
            align={'center'}
            justify={'flex-start'}
            asChild
          >
            <Paper variant="secondary">
              <Footer color="var(--text-secondary)" />
              Folder Cover
            </Paper>
          </Stack>
        )}

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
