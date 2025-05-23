import React, { useState } from 'react'
import styles from './FileCard.module.css'
import type { File } from '@valley/db'
import * as Menu from '@valley/ui/Menu'
import {
  Download,
  MoreHorizontal,
  Trash,
  Link,
  Footer,
  Information,
  File as FileIcon,
  CheckCircle,
} from 'geist-ui-icons'
import Stack from '@valley/ui/Stack'
import IconButton from '@valley/ui/IconButton'
import { formatBytes } from '../../utils/misc'
import cx from 'classnames'
import { useModal } from 'app/hooks/useModal'
import Paper from '@valley/ui/Paper'
import Image from '@valley/ui/Image'

type FileCardMenuContentProps = {
  file: File
  selectItem?: (id: string) => void
}

const FileCardMenuContent: React.FC<FileCardMenuContentProps> = ({
  file,
  selectItem,
}) => {
  const { openModal } = useModal()
  const contentType =
    file.contentType?.split('/')[1].toUpperCase() || file.contentType

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
        gap={3}
        direction={'row'}
        padding={2}
        align={'center'}
        className={styles.fileCard__menuHeader}
      >
        <Stack
          align={'center'}
          justify={'center'}
          className={styles.fileCard__menuHeaderPreview}
        >
          {file.canHaveThumbnails && (
            <Image
              containerProps={{ className: styles.fileCard__menuHeaderPreview }}
              file={file}
              thumbnail="sm"
            />
          )}
          {!file.canHaveThumbnails && <FileIcon width={24} height={24} />}
        </Stack>
        <Stack gap={0.5} direction={'column'}>
          <h6>{file.name}</h6>
          <p>
            {contentType} · {formatBytes(Number(file.size))}
          </p>
        </Stack>
      </Stack>
      <Menu.Separator />
      <Menu.Item
        onClick={handleSetCover}
        before={<Footer className="text-secondary" />}
      >
        Set as folder cover
      </Menu.Item>
      <Menu.Item before={<Link className="text-secondary" />}>
        Copy link
      </Menu.Item>
      <Menu.Item before={<Download className="text-secondary" />}>
        Download
      </Menu.Item>
      <Menu.Item before={<Information className="text-secondary" />}>
        Info
      </Menu.Item>
      <Menu.Item
        onClick={selectItem?.bind(null, file.id)}
        before={<CheckCircle className="text-secondary" />}
      >
        Select
      </Menu.Item>
      <Menu.Separator />
      <Menu.Item
        onClick={handleFileDelete}
        before={<Trash className="text-ds-red-700" />}
      >
        Delete
      </Menu.Item>
    </Menu.Content>
  )
}

type FileCardProps = {
  file: File
  isCover?: boolean
  preventSelection?: () => void
  restoreSelection?: () => void
  selectItem?: (id: string) => void
} & React.DetailedHTMLProps<
  React.LiHTMLAttributes<HTMLLIElement>,
  HTMLLIElement
>

const FileCard: React.FC<FileCardProps> = ({
  file,
  isCover,
  selectItem,
  ...props
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false)

  return (
    <Menu.Root openOnContextMenu onOpenChange={setDropdownOpen}>
      <li {...props} className={cx(styles.fileCard)} id={file.id}>
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
              <Footer className="text-secondary" />
              Cover
            </Paper>
          </Stack>
        )}

        <Stack
          className={styles.fileCard__toolbar}
          gap={2}
          align={'center'}
          data-menu-open={isDropdownOpen}
        >
          <Menu.Trigger asChild>
            <IconButton size="sm" variant="secondary-dimmed">
              <MoreHorizontal />
            </IconButton>
          </Menu.Trigger>
          <FileCardMenuContent selectItem={selectItem} file={file} />
        </Stack>
      </li>
    </Menu.Root>
  )
}

export default FileCard
