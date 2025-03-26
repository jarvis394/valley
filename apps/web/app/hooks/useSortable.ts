import { SMALL_VIEWPORT_WIDTH } from '@valley/ui/config/theme'
import { useRef, useState, useCallback } from 'react'
import { type SortableEvent } from 'sortablejs'
import Sortable from 'sortablejs'
import { useMediaQuery } from 'usehooks-ts'
import { useSortable as useSortableJS, UseSortableProps } from 'use-sortablejs'

export const useSortable = <T>({
  setItems,
  options,
  disableSelectionByDefault,
}: UseSortableProps<T> & {
  disableSelectionByDefault?: boolean
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSelectingDisabled, setSelectingDisabled] = useState(
    disableSelectionByDefault
  )
  const isMobile = useMediaQuery(`(max-width:${SMALL_VIEWPORT_WIDTH}px)`)
  const timeDelay = isMobile ? 200 : 0
  const sortableRef = useRef<Sortable | null>(null)
  // @ts-expect-error - wrong types in @types/sortablejs
  const deselectHandler = sortableRef.current?.multiDrag?._deselectMultiDrag

  const onSelect = useCallback(
    (event: SortableEvent) => {
      if (disableSelectionByDefault) {
        setSelectingDisabled(false)
      }

      setSelectedIds(event.items.map((item) => item.id))
    },
    [disableSelectionByDefault]
  )

  const onDeselect = useCallback(
    (event: SortableEvent) => {
      const items = event.items.map((item) => item.id)
      setSelectedIds(items)

      if (items.length === 0 && disableSelectionByDefault) {
        setSelectingDisabled(true)
      }
    },
    [disableSelectionByDefault]
  )

  const onSort = useCallback((event: SortableEvent) => {
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
  }, [])

  const selectItem = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    Sortable.utils.select(el)
    setSelectingDisabled(false)
    setSelectedIds((prev) => [...prev, id])
  }, [])

  const deselectItem = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    Sortable.utils.deselect(el)
    setSelectedIds((prev) => prev.filter((e) => e !== id))
  }, [])

  const preventSelection = useCallback(() => {
    setSelectingDisabled(true)

    document.removeEventListener('mouseup', deselectHandler, false)
    document.removeEventListener('pointerup', deselectHandler, false)
    document.removeEventListener('touchend', deselectHandler, false)
  }, [deselectHandler])

  const restoreSelection = useCallback(() => {
    setSelectingDisabled(false)

    document.removeEventListener('mouseup', deselectHandler, false)
    document.addEventListener('mouseup', deselectHandler, false)
    document.removeEventListener('pointerup', deselectHandler, false)
    document.addEventListener('pointerup', deselectHandler, false)
    document.removeEventListener('touchend', deselectHandler, false)
    document.addEventListener('touchend', deselectHandler, false)
  }, [deselectHandler])

  const { getRootProps, getItemProps } = useSortableJS({
    setItems,
    sortableRef,
    options: {
      multiDrag: true,
      animation: 200,
      delay: timeDelay,
      delayOnTouchOnly: true,
      disabled: isSelectingDisabled,
      fallbackTolerance: 3,
      // @ts-expect-error - wrong types
      supportPointer: true,
      ...options,
      onSelect,
      onDeselect,
      onSort,
    },
  })

  return {
    sortableRef,
    selectedIds,
    deselectHandler,
    getRootProps,
    getItemProps,
    selectItem,
    deselectItem,
    preventSelection,
    restoreSelection,
  }
}
