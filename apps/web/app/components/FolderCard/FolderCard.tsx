import React from 'react'
import ButtonBase from '@valley/ui/ButtonBase'
import styles from './FolderCard.module.css'
import IconButton from '@valley/ui/IconButton'
import { MoreVertical } from 'geist-ui-icons'
import { formatBytes } from '../../utils/formatBytes'
import cx from 'classnames'
import { SerializedFolder } from '@valley/shared'

type FolderCardProps = {
  folder: SerializedFolder
  active?: boolean
  onClick?: (folder: SerializedFolder) => void
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, active, onClick }) => {
  const totalSize = formatBytes(folder.totalSize)

  const handleClick = () => {
    onClick?.(folder)
  }

  return (
    <ButtonBase
      component={'a'}
      variant="secondary"
      onClick={handleClick}
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
      <IconButton size="sm" variant="tertiary">
        <MoreVertical />
      </IconButton>
    </ButtonBase>
  )
}

export default FolderCard
