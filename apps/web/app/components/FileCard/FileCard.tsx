import React from 'react'
import styles from './FileCard.module.css'
import { File } from '@valley/db'
import { API_URL } from '../../config/constants'

type FileCardProps = {
  file: File
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  return (
    <div className={styles.fileCard}>
      <div className={styles.fileCard__imageContainer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.fileCard__image}
          src={API_URL + '/files/' + file.thumbnailKey}
          alt={file.key}
        />
      </div>
      <p className={styles.fileCard__name}>{file.name}</p>
    </div>
  )
}

export default FileCard
