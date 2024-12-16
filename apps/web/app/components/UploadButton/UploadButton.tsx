import React from 'react'
import ButtonBase from '@valley/ui/ButtonBase'
import styles from './UploadButton.module.css'
import { CloudUpload } from 'geist-ui-icons'
import { useUpload } from '../../hooks/useUpload'
import cx from 'classnames'
import Button from '@valley/ui/Button'

type UploadButtonProps = {
  projectId: string
  folderId: string
  variant?: 'button' | 'compact' | 'square'
}

const UploadButton: React.FC<UploadButtonProps> = ({
  projectId,
  folderId,
  variant = 'square',
  ...props
}) => {
  const { register } = useUpload({ projectId, folderId })
  const iconSize = variant === 'compact' ? 24 : 48

  if (variant === 'button') {
    return (
      <Button
        {...register<HTMLButtonElement>()}
        variant="primary"
        size="lg"
        before={<CloudUpload />}
      >
        Upload files
      </Button>
    )
  }

  return (
    <ButtonBase
      {...props}
      {...register<HTMLButtonElement>()}
      variant="secondary"
      className={cx(styles.uploadButton, {
        [styles['uploadButton--square']]: variant === 'square',
        [styles['uploadButton--compact']]: variant === 'compact',
      })}
    >
      <CloudUpload width={iconSize} height={iconSize} />
      Upload files to {variant === 'square' && <br />}
      the folder
    </ButtonBase>
  )
}

export default React.memo(UploadButton)
