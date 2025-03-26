import Button from '@valley/ui/Button'
import Hidden from '@valley/ui/Hidden'
import IconButton from '@valley/ui/IconButton'
import Wrapper from '@valley/ui/Wrapper'
import FileCard from 'app/components/FileCard/FileCard'
import UploadButton from 'app/components/UploadButton/UploadButton'
import { useProjectsStore } from 'app/stores/projects'
import { useProject } from 'app/utils/project'
import { SortAscending, Trash } from 'geist-ui-icons'
import Stack from '@valley/ui/Stack'
import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import styles from './project.module.css'
import { File } from '@valley/db'
import { useSortable } from 'app/hooks/useSortable'
import { AnimatePresence, motion } from 'framer-motion'
import { useFiles } from 'app/utils/files'

const FolderFiles: React.FC<{ files: File[] | null }> = ({
  files: propsFiles,
}) => {
  const project = useProject()
  const { projectId = '', folderId = '' } = useParams()
  const files = useFiles()
  const setFiles = useProjectsStore((state) => state.setFiles)
  const cover = files.find((e) => e.id === project.cover?.[0]?.fileId)

  const onListUpdate: React.Dispatch<React.SetStateAction<File[]>> = (prop) => {
    setFiles({
      projectId,
      folderId,
      files: typeof prop === 'function' ? prop(files) : prop,
    })
  }

  const {
    getItemProps,
    getRootProps,
    preventSelection,
    restoreSelection,
    selectItem,
    selectedIds: selectedFileIds,
  } = useSortable({
    setItems: onListUpdate,
    disableSelectionByDefault: true,
    options: {
      ghostClass: styles['project__files--ghost'],
      selectedClass: styles['project__files--selected'],
      dragClass: styles['project__files--drag'],
    },
  })

  // Set the folder's files to the cache store
  // Used for optimistic updates
  useEffect(() => {
    setFiles({ projectId, folderId, files: propsFiles || [] })
  }, [folderId, projectId, propsFiles, setFiles])

  if (files.length === 0) {
    return (
      <Stack
        fullHeight
        fullWidth
        direction={'column'}
        gap={6}
        align={'center'}
        justify={'center'}
        className={styles.project__placeholder}
        padding={8}
      >
        <Stack direction={'column'} gap={4} align={'center'} justify={'center'}>
          <h1>This folder does not contain any files</h1>
          <p>Upload some photos to make it happier</p>
        </Stack>
        <UploadButton
          projectId={projectId}
          folderId={folderId}
          variant="button"
        />
      </Stack>
    )
  }

  return (
    <>
      <AnimatePresence>
        {selectedFileIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, bottom: -56 }}
            animate={{ opacity: 1, bottom: 0 }}
            exit={{ opacity: 0, bottom: -56 }}
            transition={{ duration: 0.2, ease: 'circInOut' }}
            className={styles.project__filesSelectBar}
          >
            <Wrapper asChild>
              <Stack
                onMouseEnter={preventSelection}
                onTouchStart={preventSelection}
                onMouseLeave={restoreSelection}
                onTouchEnd={restoreSelection}
                padding={2}
                align={'center'}
                gap={8}
                justify={'center'}
              >
                <span>Selected {selectedFileIds.length} files</span>
                <IconButton size="md" variant="danger-dimmed">
                  <Trash />
                </IconButton>
              </Stack>
            </Wrapper>
          </motion.div>
        )}
      </AnimatePresence>
      <Stack direction={'column'} gap={{ sm: 3, md: 4 }}>
        <Hidden asChild md lg xl>
          <Stack asChild gap={3} align={'center'} justify={'center'}>
            <Wrapper>
              <UploadButton
                projectId={projectId}
                folderId={folderId}
                variant="compact"
              />
              <IconButton variant="secondary-dimmed" size="xl">
                <SortAscending />
              </IconButton>
            </Wrapper>
          </Stack>
        </Hidden>
        <Hidden sm asChild>
          <Wrapper asChild>
            <Stack gap={4} align={'center'} justify={'space-between'}>
              <Stack gap={4} align={'center'}>
                <UploadButton
                  projectId={projectId}
                  folderId={folderId}
                  variant="button"
                  size="md"
                />
                <p className={styles.project__uploadHint}>
                  You can also drop files anywhere on the page
                </p>
              </Stack>
              <Button
                variant="secondary-dimmed"
                size="md"
                before={<SortAscending />}
              >
                Sort by date shot
              </Button>
            </Stack>
          </Wrapper>
        </Hidden>

        <Wrapper {...getRootProps()} className={styles.project__files}>
          {files.map((file) => (
            <FileCard
              {...getItemProps(file)}
              isCover={cover?.id === file.id}
              key={folderId + '-' + file.id}
              file={file}
              selectItem={selectItem}
            />
          ))}
        </Wrapper>
      </Stack>
    </>
  )
}

export default React.memo(FolderFiles)
