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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router'
import styles from './project.module.css'
import { File } from '@valley/db'
import Sortable, { type SortableEvent } from 'sortablejs'
import { useSortable } from 'use-sortablejs'
import { AnimatePresence, motion } from 'framer-motion'

type SortableFile = File & {
  chosen: boolean
  selected: boolean
}

const useEventHandlersManager = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler?: (this: Document, ev: PointerEvent | MouseEvent | TouchEvent) => any
) => {
  const removeHandlers = useCallback(() => {
    if (handler) {
      document.removeEventListener('pointerup', handler, false)
      document.removeEventListener('mouseup', handler, false)
      document.removeEventListener('touchend', handler, false)
    }
  }, [handler])

  const addHandlers = useCallback(() => {
    if (handler) {
      document.removeEventListener('pointerup', handler, false)
      document.addEventListener('pointerup', handler, false)
      document.removeEventListener('mouseup', handler, false)
      document.addEventListener('mouseup', handler, false)
      document.removeEventListener('touchend', handler, false)
      document.addEventListener('touchend', handler, false)
    }
  }, [handler])

  return {
    removeHandlers,
    addHandlers,
  }
}

const FolderFiles: React.FC<{ files: File[] | null }> = ({
  files: propsFiles,
}) => {
  const [selectedFileIds, setSelectedFileIds] = useState<
    Array<SortableFile['id']>
  >([])
  const project = useProject()
  const { projectId = '', folderId = '' } = useParams()
  const storeFiles = useProjectsStore(
    (state) => state.projects[projectId]?.folders[folderId]?.files
  )
  const files = useMemo(() => {
    if (storeFiles && storeFiles?.length > 0)
      return storeFiles as SortableFile[]
    else return (propsFiles as SortableFile[]) || []
  }, [propsFiles, storeFiles])
  const setFiles = useProjectsStore((state) => state.setFiles)
  const cover = files.find((e) => e.id === project.cover?.[0]?.fileId)
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 960px)').matches
  const isSafari =
    isMobile && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const timeDelay = isMobile ? 200 : 0
  const [deselectPhotoHandlers, setDeselectPhotoHandlers] = useState()
  const { addHandlers, removeHandlers } = useEventHandlersManager(
    deselectPhotoHandlers
  )
  const sortableRef = useRef<Sortable>(null)

  const onSelect = useCallback((event: SortableEvent) => {
    // @ts-expect-error sortable has multiDrag property after plugins init
    const handler = sortableRef.current?.multiDrag?._deselectMultiDrag
    setDeselectPhotoHandlers(() => handler)
    setSelectedFileIds(event.items.map((item) => item.id))
  }, [])

  const onDeselect = useCallback((event: SortableEvent) => {
    setSelectedFileIds(event.items.map((item) => item.id))
  }, [])

  const onListUpdate: React.Dispatch<React.SetStateAction<SortableFile[]>> = (
    prop
  ) => {
    setFiles({
      projectId,
      folderId,
      files: typeof prop === 'function' ? prop(files) : prop,
    })
  }

  const onSort = (event: SortableEvent) => {
    const isMultiDragActive = event.items.length > 1
    const draggedPhotosId = isMultiDragActive
      ? event.items.map((e) => e.id)
      : [event.item.id]

    if (event.oldIndex === undefined || event.newIndex === undefined) return

    const diff = event.oldIndex - event.newIndex
    const oldIndicies = event.oldIndicies.map(({ index }) => index - diff)
    const draggedPhotosPosition = isMultiDragActive
      ? oldIndicies.map((index) => index)
      : [event.newIndex]

    const mediaFiles: Record<string, number> = {}
    for (let i = 0; i < draggedPhotosId.length; i += 1) {
      mediaFiles[draggedPhotosId[i]] = draggedPhotosPosition[i]
    }

    console.log(mediaFiles)
  }

  const { getRootProps, getItemProps } = useSortable({
    setItems: onListUpdate,
    sortableRef,
    options: {
      multiDrag: true,
      ghostClass: styles['project__files--ghost'],
      selectedClass: styles['project__files--selected'],
      dragClass: styles['project__files--drag'],
      animation: 200,
      delay: timeDelay,
      delayOnTouchOnly: true,
      forceFallback: isSafari,
      bubbleScroll: true,
      dropBubble: true,
      dragoverBubble: true,
      fallbackTolerance: 3,
      onSelect,
      onDeselect,
      onSort,
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
                onMouseEnter={removeHandlers}
                onMouseLeave={addHandlers}
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
              preventSelection={removeHandlers}
              restoreSelection={addHandlers}
            />
          ))}
        </Wrapper>
      </Stack>
    </>
  )
}

export default React.memo(FolderFiles)
