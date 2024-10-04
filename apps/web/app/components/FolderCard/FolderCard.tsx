import React from 'react'
import ButtonBase from '@valley/ui/ButtonBase'
import styles from './FolderCard.module.css'
import { formatBytes } from '../../utils/formatBytes'
import cx from 'classnames'
import { SerializedFolder } from '@valley/shared'
import MenuIconButton from '@valley/ui/MenuIconButton'
import {
  MoreVertical,
  PencilEdit,
  Trash,
  Menu as MenuIcon,
} from 'geist-ui-icons'
import Menu from '@valley/ui/Menu'
import Dropdown from '@valley/ui/Dropdown'
import MenuItem from '@valley/ui/MenuItem'
import { useContextMenu } from '@valley/ui/useContextMenu'
import MenuSeparator from '@valley/ui/MenuSeparator'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

type FolderCardProps = {
  folder: SerializedFolder
  active?: boolean
  onClick?: (folder: SerializedFolder) => void
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, active, onClick }) => {
  const totalSize = formatBytes(folder.totalSize)
  const { dropdownProps, onContextMenu, onMenuButtonClick, anchor } =
    useContextMenu()
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleClick = () => {
    onClick?.(folder)
  }

  const handleFolderRename = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'edit-folder-title')
    params.set('modal-folderId', folder.id.toString())
    router.push(`/projects/${id}?${params.toString()}`)
  }

  const handleFolderDelete = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'confirm-folder-deletion')
    params.set('modal-folderId', folder.id.toString())
    router.push(`/projects/${id}?${params.toString()}`)
  }

  return (
    <Dropdown {...dropdownProps}>
      <ButtonBase
        asChild
        variant="secondary"
        className={cx(styles.folderCard, {
          [styles['folderCard--active']]: active,
        })}
      >
        <a onClick={handleClick} onContextMenu={onContextMenu}>
          <div className={styles.folderCard__content}>
            <h5 className={styles.folderCard__contentTitle}>{folder.title}</h5>
            <div className={styles.folderCard__contentSubtitle}>
              <p>{folder.totalFiles} files</p>
              <span>•</span>
              <p>{totalSize}</p>
            </div>
          </div>

          <MenuIconButton
            onClick={onMenuButtonClick}
            size="sm"
            variant="tertiary"
          >
            <MoreVertical />
          </MenuIconButton>
          <Menu
            container={window.document.body}
            id={'folderMenu-' + folder.id.toString()}
            placement="bottom-start"
            anchor={anchor}
          >
            <MenuItem
              onClick={handleFolderRename}
              before={<PencilEdit color="var(--text-secondary)" />}
            >
              Rename
            </MenuItem>
            <MenuItem before={<MenuIcon color="var(--text-secondary)" />}>
              Reorder
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              onClick={handleFolderDelete}
              before={<Trash color="var(--red-600)" />}
            >
              Delete
            </MenuItem>
          </Menu>
        </a>
      </ButtonBase>
    </Dropdown>
  )
}

export default React.memo(FolderCard)
