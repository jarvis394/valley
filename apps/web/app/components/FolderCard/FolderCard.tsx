import React from 'react'
import ButtonBase from '@valley/ui/ButtonBase'
import styles from './FolderCard.module.css'
import cx from 'classnames'
import {
  MoreVertical,
  PencilEdit,
  Trash,
  Menu as MenuIcon,
} from 'geist-ui-icons'
import Menu from '@valley/ui/Menu'
import { formatBytes } from 'app/utils/misc'
import type { Folder } from '@valley/db'
import IconButton from '@valley/ui/IconButton'
import { Link, useNavigation, useParams } from '@remix-run/react'
import { useModal } from 'app/hooks/useModal'

type FolderCardProps = {
  folder: Folder
  onClick?: (e: React.MouseEvent, folder: Folder) => void
}

const FolderCardMenuContent: React.FC<{
  folder: Folder
}> = ({ folder }) => {
  const { openModal } = useModal()

  const handleFolderRename = () => {
    openModal('edit-folder-title', {
      folderId: folder.id,
    })
  }

  const handleFolderDelete = () => {
    openModal('confirm-folder-deletion', {
      folderId: folder.id,
    })
  }

  const handleFolderClear = () => {
    openModal('confirm-folder-clear', {
      folderId: folder.id,
    })
  }

  return (
    <Menu.Content>
      <Menu.Item
        onClick={handleFolderRename}
        before={<PencilEdit color="var(--text-secondary)" />}
      >
        Rename
      </Menu.Item>
      <Menu.Item before={<MenuIcon color="var(--text-secondary)" />}>
        Reorder
      </Menu.Item>
      <Menu.Separator />
      {folder.isDefaultFolder && (
        <>
          <Menu.Item
            onClick={handleFolderClear}
            before={<Trash color="var(--red-600)" />}
          >
            Delete all files
          </Menu.Item>
        </>
      )}
      {!folder.isDefaultFolder && (
        <Menu.Item
          onClick={handleFolderDelete}
          before={<Trash color="var(--red-600)" />}
        >
          Delete
        </Menu.Item>
      )}
    </Menu.Content>
  )
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick }) => {
  const { projectId, folderId } = useParams()
  const isActive = folderId ? folderId === folder.id : folder.isDefaultFolder
  const totalSize = formatBytes(Number(folder.totalSize))
  const navigation = useNavigation()
  const folderLink = '/projects/' + projectId + '/folder/' + folder.id
  const isLoading =
    navigation.state === 'loading' &&
    navigation.location?.pathname === folderLink

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.(e, folder)
  }

  const handleMenuClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Menu.Root openOnContextMenu>
      <ButtonBase
        asChild
        variant="secondary"
        shimmer={isLoading}
        className={cx(styles.folderCard, {
          [styles['folderCard--active']]: isActive,
        })}
      >
        <Link onClick={handleClick} replace discover="render" to={folderLink}>
          <div className={styles.folderCard__content}>
            <h5 className={styles.folderCard__contentTitle}>{folder.title}</h5>
            <div className={styles.folderCard__contentSubtitle}>
              <p>{folder.totalFiles} files</p>
              <span>•</span>
              <p>{totalSize}</p>
            </div>
          </div>

          <Menu.Trigger asChild>
            <IconButton onClick={handleMenuClick} size="sm" variant="tertiary">
              <MoreVertical />
            </IconButton>
          </Menu.Trigger>

          <FolderCardMenuContent folder={folder} />
        </Link>
      </ButtonBase>
    </Menu.Root>
  )
}

export default React.memo(FolderCard)
