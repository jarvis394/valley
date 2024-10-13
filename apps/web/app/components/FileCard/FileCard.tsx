import React from 'react'
import styles from './FileCard.module.css'
import { File } from '@valley/db'
import { API_URL } from '../../config/constants'
import Dropdown from '@valley/ui/Dropdown'
import MenuIconButton from '@valley/ui/MenuIconButton'
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
import Menu from '@valley/ui/Menu'
import MenuItem from '@valley/ui/MenuItem'
import MenuSeparator from '@valley/ui/MenuSeparator'
import { useContextMenu } from '@valley/ui/useContextMenu'
import IconButton from '@valley/ui/IconButton'
import { formatBytes } from '../../utils/formatBytes'

type FileCardProps = {
  file: File
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const { dropdownProps, onContextMenu, onMenuButtonClick, anchor } =
    useContextMenu()

  return (
    <Dropdown {...dropdownProps}>
      <div className={styles.fileCard} onContextMenu={onContextMenu}>
        <div className={styles.fileCard__imageContainer}>
          {file.thumbnailKey && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className={styles.fileCard__image}
              src={API_URL + '/files/' + file.thumbnailKey}
              alt={file.key}
            />
          )}
        </div>
        <p className={styles.fileCard__name}>{file.name}</p>

        <Stack className={styles.fileCard__toolbar} gap={2} align={'center'}>
          <IconButton size="sm" variant="secondary-dimmed">
            <PencilEdit />
          </IconButton>
          <MenuIconButton
            onClick={onMenuButtonClick}
            size="sm"
            variant="secondary-dimmed"
          >
            <MoreHorizontal />
          </MenuIconButton>
        </Stack>

        <Menu
          container={window.document.body}
          id={'fileMenu-' + file.id.toString()}
          placement="bottom-start"
          anchor={anchor}
        >
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
      </div>
    </Dropdown>
  )
}

export default FileCard
