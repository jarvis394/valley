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
import Menu, { MenuProps } from '@valley/ui/Menu'
import MenuItem from '@valley/ui/MenuItem'
import MenuSeparator from '@valley/ui/MenuSeparator'
import { formatBytes } from 'app/utils/misc'
import { Folder } from '@valley/db'
import * as DropdownMenu from '@valley/ui/DropdownMenu'
import * as ContextMenu from '@valley/ui/ContextMenu'
import IconButton from '@valley/ui/IconButton'
import { Link, useParams, useSearchParams } from '@remix-run/react'

type FolderCardProps = {
  folder: Folder
}

const MenuContent: React.FC<{
  type?: MenuProps['type']
  folder: Folder
}> = ({ type = 'dropdown', folder }) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const handleFolderRename = () => {
    searchParams.set('modal', 'edit-folder-title')
    searchParams.set('modal-folderId', folder.id.toString())
    setSearchParams(searchParams)
  }

  const handleFolderDelete = () => {
    searchParams.set('modal', 'confirm-folder-deletion')
    searchParams.set('modal-folderId', folder.id.toString())
    setSearchParams(searchParams)
  }

  return (
    <Menu type={type}>
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
  )
}

const FolderCard: React.FC<FolderCardProps> = ({ folder }) => {
  const { folderId } = useParams()
  const isActive = folderId ? folderId === folder.id : folder.isDefaultFolder
  const totalSize = formatBytes(Number(folder.totalSize))

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <ButtonBase
          asChild
          variant="secondary"
          className={cx(styles.folderCard, {
            [styles['folderCard--active']]: isActive,
          })}
        >
          <Link to={'./folder/' + folder.id}>
            <DropdownMenu.Root modal={false}>
              <div className={styles.folderCard__content}>
                <h5 className={styles.folderCard__contentTitle}>
                  {folder.title}
                </h5>
                <div className={styles.folderCard__contentSubtitle}>
                  <p>{folder.totalFiles} files</p>
                  <span>•</span>
                  <p>{totalSize}</p>
                </div>
              </div>

              <DropdownMenu.Trigger asChild>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  size="sm"
                  variant="tertiary"
                >
                  <MoreVertical />
                </IconButton>
              </DropdownMenu.Trigger>

              <MenuContent type={'dropdown'} folder={folder} />
            </DropdownMenu.Root>
          </Link>
        </ButtonBase>
      </ContextMenu.Trigger>
      <MenuContent type={'context'} folder={folder} />
    </ContextMenu.Root>
  )
}

export default React.memo(FolderCard)
