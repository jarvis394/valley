import React, { useEffect, useMemo, useState } from 'react'
import { useUploadsStore } from '../../stores/uploads'
import { Portal } from '@valley/ui/Portal'
import styles from './UploadsOverlay.module.css'
import Spinner from '@valley/ui/Spinner'
import { formatBytes } from '../../utils/misc'
import IconButton from '@valley/ui/IconButton'
import { CheckCircleFill, ChevronUp, Cross } from 'geist-ui-icons'
import cx from 'classnames'
import ButtonBase from '@valley/ui/ButtonBase'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import Gauge from '@valley/ui/Gauge'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ClientOnly } from 'remix-utils/client-only'

dayjs.extend(relativeTime)

type UploadsOverlayHeaderProps = {
  isExpanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  setHidden: React.Dispatch<React.SetStateAction<boolean>>
}

const UploadsOverlayHeader: React.FC<UploadsOverlayHeaderProps> = ({
  isExpanded,
  setExpanded,
  setHidden,
}) => {
  const uploads = useUploadsStore((state) => state.uploads)
  const isUploading = useUploadsStore((state) => state.isUploading)
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
  }, [uploads])

  return (
    <div className={styles.uploadsOverlay__header}>
      <div className={styles.uploadsOverlay__headerContent}>
        <div className={styles.uploadsOverlay__spinner}>
          {!isUploading && (
            <CheckCircleFill color="var(--green-700)" width={20} height={20} />
          )}
          {isUploading && <Spinner />}
        </div>
        <div className={styles.uploadsOverlay__headerContentTextContainer}>
          {!isUploading && <h5>Uploaded {uploadsCount} files</h5>}
          {isUploading && <h5>Uploading {uploadsCount} files...</h5>}
          <p>
            {!isUploading && <>Total of {formatBytes(bytesUploaded)}</>}
            {isUploading && (
              <>
                {uploadsLeftCount} files left<span>•</span>
                {formatBytes(bytesUploaded)} of {formatBytes(totalBytes)}
              </>
            )}
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
      <IconButton onClick={() => setHidden(true)} size="md" variant="tertiary">
        <Cross />
      </IconButton>
    </div>
  )
}

const UploadsOverlay: React.FC = () => {
  const [isHidden, setHidden] = useState(false)
  const [isExpanded, setExpanded] = useState(false)
  const isUploading = useUploadsStore((state) => state.isUploading)
  const uploads = useUploadsStore((state) => state.uploads)
  const uploadSpeed = useUploadsStore((state) => state.uploadSpeed)
  const shouldShowUploadsOverlay =
    Object.keys(uploads).length !== 0 && !isHidden

  useEffect(() => {
    if (isUploading) {
      setHidden(false)
    }
  }, [isUploading])

  return (
    <ClientOnly>
      {() => (
        <Portal asChild container={document.body}>
          <div
            data-fade-in={shouldShowUploadsOverlay}
            className={cx(styles.uploadsOverlay, 'fade', {
              [styles['uploadsOverlay--expanded']]: isExpanded,
            })}
          >
            <UploadsOverlayHeader
              isExpanded={isExpanded}
              setExpanded={setExpanded}
              setHidden={setHidden}
            />

            {isUploading && (
              <div className={styles.uploadsOverlay__separator}>
                {formatBytes(uploadSpeed)}
                <ButtonBase
                  onClick={() => {}}
                  className={styles.uploadsOverlay__cancelButton}
                >
                  Cancel
                </ButtonBase>
              </div>
            )}

            <OverlayScrollbarsComponent
              defer
              options={{ scrollbars: { theme: 'os-theme-light' } }}
              className={styles.uploadsOverlay__files}
            >
              {Object.values(uploads).map((e) => (
                <div
                  className={styles.uploadsOverlay__file}
                  key={'upload_' + e.id}
                >
                  <p>{e.name}</p>
                  <div className={styles.uploadsOverlay__fileProgress}>
                    <div data-hidden={!e.isUploading}>
                      <Gauge size="xs" value={e.progress * 100} />
                    </div>
                    <div data-hidden={!e.isUploaded}>
                      <CheckCircleFill
                        color="var(--green-700)"
                        width={24}
                        height={24}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </OverlayScrollbarsComponent>
          </div>
        </Portal>
      )}
    </ClientOnly>
  )
}

export default React.memo(UploadsOverlay)
