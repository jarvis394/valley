import React from 'react'
import ButtonBase from '@valley/ui/ButtonBase'
import styles from './FolderCard.module.css'
import cx from 'classnames'
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
import { formatBytes } from 'app/utils/misc'
import { Folder } from '@valley/db'

type FolderCardProps = {
  folder: Folder
  active?: boolean
  onClick?: (folder: Folder) => void
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, active, onClick }) => {
  const totalSize = formatBytes(Number(folder.totalSize))
  const { dropdownProps, onContextMenu, onMenuButtonClick, anchor } =
    useContextMenu()

  const handleClick = () => {
    onClick?.(folder)
  }

  // const handleFolderRename = () => {
  //   const params = new URLSearchParams(searchParams.toString())
  //   params.set('modal', 'edit-folder-title')
  //   params.set('modal-folderId', folder.id.toString())
  //   router.push(`/projects/${id}?${params.toString()}`)
  // }

  // const handleFolderDelete = () => {
  //   const params = new URLSearchParams(searchParams.toString())
  //   params.set('modal', 'confirm-folder-deletion')
  //   params.set('modal-folderId', folder.id.toString())
  //   router.push(`/projects/${id}?${params.toString()}`)
  // }

  return (
    <Dropdown {...dropdownProps}>
      <ButtonBase
        onClick={handleClick}
        onContextMenu={onContextMenu}
        variant="secondary"
        className={cx(styles.folderCard, {
          [styles['folderCard--active']]: active,
        })}
      >
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
            // onClick={handleFolderRename}
            before={<PencilEdit color="var(--text-secondary)" />}
          >
            Rename
          </MenuItem>
          <MenuItem before={<MenuIcon color="var(--text-secondary)" />}>
            Reorder
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            // onClick={handleFolderDelete}
            before={<Trash color="var(--red-600)" />}
          >
            Delete
          </MenuItem>
        </Menu>
      </ButtonBase>
    </Dropdown>
  )
}

export default React.memo(FolderCard)
