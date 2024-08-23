import React from 'react'
import ButtonBase from '@valley/ui/ButtonBase'
import styles from './FolderCard.module.css'
import { Folder } from '@valley/db'
import IconButton from '@valley/ui/IconButton'
import { MoreVertical } from 'geist-ui-icons'
import cx from 'classnames'

type FolderCardProps = {
  folder: Folder
  active?: boolean
  onClick?: (folder: Folder) => void
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, active, onClick }) => {
  const handleClick = () => {
    onClick?.(folder)
  }

  return (
    <ButtonBase
      variant="secondary"
      component={'a'}
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
          <p>{folder.totalSize} MB</p>
        </div>
      </div>
      <IconButton size="sm" variant="tertiary">
        <MoreVertical />
      </IconButton>
    </ButtonBase>
  )
}

export default FolderCard
