import React, { useMemo } from 'react'
import ButtonBase from '@valley/ui/ButtonBase'
import styles from './FolderCard.module.css'
import cx from 'classnames'
import { CheckCircleFill, PencilEdit, Trash } from 'geist-ui-icons'
import { formatBytes } from 'app/utils/misc'
import { Folder } from '@valley/db'
import { useParams, useSearchParams } from '@remix-run/react'
import DragIndicator from '../svg/DragIndicator'
import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import IconButton from '@valley/ui/IconButton'
import Stack from '@valley/ui/Stack'

type FolderListItemMode = 'edit' | 'default'

type FolderListItemProps = {
  folder: Folder
  mode?: FolderListItemMode
  isOverlay?: boolean
  onClick?: (folder: Folder) => void
  onFolderRename?: (folder: Folder) => void
  onFolderDelete?: (folder: Folder) => void
}

const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  mode = 'default',
  isOverlay,
  onClick,
  onFolderDelete,
  onFolderRename,
  ...props
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { folderId } = useParams()
  const isActive = useMemo(() => {
    if (mode === 'edit') return false
    return folderId ? folderId === folder.id : folder.isDefaultFolder
  }, [folder.id, folder.isDefaultFolder, folderId, mode])
  const totalSize = formatBytes(Number(folder.totalSize))
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
    id: folder.id,
    animateLayoutChanges,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleClick = () => {
    if (mode === 'edit') return
    onClick?.(folder)
  }

  const handleFolderRename = () => {
    onFolderRename?.(folder)
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'edit-folder-title')
    params.set('modal-folderId', folder.id.toString())
    setSearchParams(params, {
      state: {
        defaultTitle: folder.title,
      },
    })
  }

  const handleFolderDelete = () => {
    onFolderDelete?.(folder)
    searchParams.set('modal', 'confirm-folder-deletion')
    searchParams.set('modal-folderId', folder.id.toString())
    setSearchParams(searchParams)
  }

  return (
    <ButtonBase
      {...props}
      asChild
      ref={setNodeRef}
      variant="tertiary"
      style={style}
      onClick={handleClick}
      className={cx(styles.folderCard, {
        [styles['folderCard--active']]: isActive,
        [styles['folderCard--dragging']]: isDragging,
        [styles['folderCard--overlay']]: isOverlay,
        [styles['folderCard--editing']]: mode === 'edit',
      })}
    >
      <li>
        {mode === 'edit' && (
          <IconButton
            {...attributes}
            {...listeners}
            variant="tertiary-dimmed"
            className={styles.folderCard__handle}
            size="md"
          >
            <DragIndicator width={24} height={24} />
          </IconButton>
        )}
        <div className={styles.folderCard__content}>
          <h5 className={styles.folderCard__contentTitle}>{folder.title}</h5>
          <div className={styles.folderCard__contentSubtitle}>
            <p>{folder.totalFiles} files</p>
            <span>•</span>
            <p>{totalSize}</p>
          </div>
        </div>
        <CheckCircleFill
          data-fade-in={isActive}
          className={cx(styles.folderCard__activeIcon, 'fade')}
        />
        <Stack
          className="fade"
          data-fade-in={mode === 'edit'}
          gap={1}
          direction={'row'}
          align={'center'}
        >
          <IconButton onClick={handleFolderRename} variant="tertiary" size="md">
            <PencilEdit color="var(--text-secondary)" />
          </IconButton>
          {!folder.isDefaultFolder && (
            <IconButton
              onClick={handleFolderDelete}
              variant="tertiary"
              size="md"
            >
              <Trash color="var(--red-600)" />
            </IconButton>
          )}
        </Stack>
      </li>
    </ButtonBase>
  )
}

export default React.memo(FolderListItem)
