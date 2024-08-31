import React from 'react'
import ButtonBase from '@valley/ui/ButtonBase'
import styles from './UploadButton.module.css'
import { CloudUpload } from 'geist-ui-icons'
import { useUpload } from '../../hooks/useUpload'

type UploadButtonProps = {
  projectId: number
  folderId: number
}

const UploadButton: React.FC<UploadButtonProps> = ({ projectId, folderId }) => {
  const { register } = useUpload({ projectId, folderId })

  return (
    <ButtonBase
      {...register()}
      component={'button'}
      variant="secondary"
      className={styles.uploadButton}
    >
      <CloudUpload width={48} height={48} />
      Upload file to
      <br />
      the folder
    </ButtonBase>
  )
}

export default React.memo(UploadButton)
