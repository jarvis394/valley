'use client'
import React, { useMemo, useState } from 'react'
import { useUploadsStore } from '../../hooks/useUpload'
import { Portal } from '@mui/base/Portal'
import styles from './UploadsOverlay.module.css'
import Fade from '@valley/ui/Fade'
import Spinner from '@valley/ui/Spinner'
import { formatBytes } from '../../utils/formatBytes'
import IconButton from '@valley/ui/IconButton'
import { ChevronUp, Cross } from 'geist-ui-icons'
import cx from 'classnames'
import ButtonBase from '@valley/ui/ButtonBase'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import Gauge from '@valley/ui/Gauge'

const UploadsOverlay: React.FC = () => {
  const [isExpanded, setExpanded] = useState(false)
  const isUploading = useUploadsStore((state) => state.isUploading)
  const uploads = useUploadsStore((state) => state.uploads)
  const uploadsCount = useUploadsStore((state) => state.uploadsCount)
  const bytesUploaded = useUploadsStore((state) => state.bytesUploaded)
  const totalBytes = useUploadsStore((state) => state.totalBytes)
  const uploadsLeftCount = useMemo(() => {
    let res = 0
    for (const id of Object.keys(uploads)) {
      const upload = uploads[id]
      if (upload.isUploading) {
        res += 1
      }
    }
    return res
  }, [])
  const shouldShowUploadsOverlay = isUploading

  return (
    <Portal container={() => document.body}>
      <Fade in={shouldShowUploadsOverlay}>
        <div
          className={cx(styles.uploadsOverlay, {
            [styles['uploadsOverlay--expanded']]: isExpanded,
          })}
        >
          <div className={styles.uploadsOverlay__header}>
            <div className={styles.uploadsOverlay__headerContent}>
              <div className={styles.uploadsOverlay__spinner}>
                <Spinner />
              </div>
              <div
                className={styles.uploadsOverlay__headerContentTextContainer}
              >
                <h5>Uploading {uploadsCount} files...</h5>
                <p>
                  {uploadsLeftCount} files left<span>•</span>
                  {formatBytes(bytesUploaded)} of {formatBytes(totalBytes)}
                </p>
              </div>
            </div>
            <IconButton
              onClick={() => setExpanded((prev) => !prev)}
              variant="tertiary"
              size="md"
            >
              <ChevronUp
                className={cx(styles.uploadsOverlay__expandIcon, {
                  [styles['uploadsOverlay__expandIcon--active']]: isExpanded,
                })}
              />
            </IconButton>
            <IconButton size="md" variant="tertiary">
              <Cross />
            </IconButton>
          </div>

          <div className={styles.uploadsOverlay__separator}>
            1 minute left
            <ButtonBase
              component="button"
              onClick={() => {}}
              className={styles.uploadsOverlay__cancelButton}
            >
              Cancel
            </ButtonBase>
          </div>

          <OverlayScrollbarsComponent
            defer
            options={{ scrollbars: { theme: 'os-theme-light' } }}
            className={styles.uploadsOverlay__files}
          >
            {Object.values(uploads).map((e) => (
              <div className={styles.uploadsOverlay__file} key={e.id}>
                <p>{e.normalizedName}</p>
                <div className={styles.uploadsOverlay__fileProgress}>
                  <Gauge size="xs" value={e.progress * 100} />
                </div>
              </div>
            ))}
          </OverlayScrollbarsComponent>
        </div>
      </Fade>
    </Portal>
  )
}

export default React.memo(UploadsOverlay)
