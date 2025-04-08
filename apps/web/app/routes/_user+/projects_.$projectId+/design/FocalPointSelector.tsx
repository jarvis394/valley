import type { Cover, File } from '@valley/db'
import Image from '@valley/ui/Image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './styles.module.css'
import { AlignmentCenter, AlignmentLeft, AlignmentRight } from 'geist-ui-icons'
import { motion, useAnimationControls } from 'framer-motion'
import { map } from 'app/utils/misc'
import { ClientOnly } from 'remix-utils/client-only'
import cx from 'classnames'
import IconButton from '@valley/ui/IconButton'
import { useDebounceFetcher } from 'remix-utils/use-debounce-fetcher'
import { useParams } from 'react-router'
import { Route } from './+types'
import { useCoversStore } from 'app/stores/covers'

const DRAGGER_SIZE = 14

type FocalPointSelectorProps = {
  file: File
  cover: Cover
}

const FocalPointSelector: React.FC<FocalPointSelectorProps> = ({
  file,
  cover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const draggerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const controls = useAnimationControls()
  const fetcher = useDebounceFetcher()
  const { projectId } = useParams<Route.ComponentProps['params']>()
  const setProjectCoverPosition = useCoversStore(
    (state) => state.setProjectCoverPosition
  )

  const submitNewCoverPosition = (position: { x: number; y: number }) => {
    fetcher.submit(
      {
        intent: 'cover-position',
        ...position,
      },
      {
        method: 'post',
        action: '/projects/' + projectId + '/design',
        debounceTimeout: 500,
      }
    )
  }

  const getDraggerRelativePosition = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      const containerRect = containerRef.current?.getBoundingClientRect()
      const { width = 0, height = 0 } = containerRect || {}

      const clampedX = map(x, 0, 1, 0, width - DRAGGER_SIZE)
      // Have to multiply by -1, framer-motion is doing Y coordinates inverted
      const clampedY = -1 * map(y, 1, 0, DRAGGER_SIZE, height)

      return {
        x: clampedX,
        y: clampedY,
      }
    },
    []
  )

  const handleDrag = () => {
    if (!containerRef.current || !draggerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const draggerRect = draggerRef.current.getBoundingClientRect()

    const x = map(
      draggerRect.left - containerRect.left,
      0,
      containerRect.width - DRAGGER_SIZE,
      0,
      1
    )
    const y = map(
      draggerRect.top - containerRect.top,
      0,
      containerRect.height - DRAGGER_SIZE,
      0,
      1
    )

    const position = {
      x: Math.max(Math.min(x, 1), 0),
      y: Math.max(Math.min(y, 1), 0),
    }

    submitNewCoverPosition(position)
    setProjectCoverPosition(projectId!, position)
  }

  const handleDragStart = () => {
    setIsDragging(true)
    handleDrag()
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    handleDrag()
  }

  const positionFocalPoint = (edge: 'right' | 'left' | 'center') => {
    const newPosition = { x: 0.5, y: 0.5 }
    if (edge === 'right') newPosition.x = 1
    else if (edge === 'left') newPosition.x = 0

    controls.start(getDraggerRelativePosition(newPosition))
    submitNewCoverPosition(newPosition)
    setProjectCoverPosition(projectId!, newPosition)
  }

  // Handle grabbing animation for cursor
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing'
    } else {
      document.body.style.removeProperty('cursor')
    }
  }, [isDragging])

  // Set initial state for dragger
  useEffect(() => {
    if (containerRef.current && cover && projectId) {
      const position = { x: cover.x, y: cover.y }
      setProjectCoverPosition(projectId, position)
      requestAnimationFrame(() =>
        controls.set(getDraggerRelativePosition(position))
      )
    }
  }, [
    controls,
    cover,
    getDraggerRelativePosition,
    projectId,
    setProjectCoverPosition,
  ])

  return (
    <div
      className="ring-alpha-transparent-12 bg-paper flex flex-col items-center gap-1 rounded-2xl px-1 pt-2 pb-1 ring-1"
      style={{ ['--dragger-size' as string]: DRAGGER_SIZE + 'px' }}
    >
      <div className="max-h-60 px-1">
        <motion.div className="relative h-full w-fit" ref={containerRef}>
          <Image
            file={file}
            thumbnail="md"
            className={styles.projectDesign__focalPointSelectorImage}
            containerProps={{
              className: styles.projectDesign__focalPointSelectorImageContainer,
            }}
          />
          <ClientOnly>
            {() => (
              <motion.div
                ref={draggerRef}
                drag
                dragConstraints={containerRef}
                dragElastic={0.01}
                dragMomentum={false}
                animate={controls}
                transition={{ type: 'spring', duration: 0.5 }}
                style={getDraggerRelativePosition(cover)}
                onDrag={handleDrag}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className={cx(
                  styles.projectDesign__focalPointSelectorDragger,
                  'fade-in'
                )}
              />
            )}
          </ClientOnly>
        </motion.div>
      </div>
      <div className="flex w-full justify-center gap-1">
        <IconButton
          size="md"
          variant="tertiary-dimmed"
          onClick={positionFocalPoint.bind(null, 'left')}
        >
          <AlignmentLeft />
        </IconButton>
        <IconButton
          size="md"
          variant="tertiary-dimmed"
          onClick={positionFocalPoint.bind(null, 'center')}
        >
          <AlignmentCenter />
        </IconButton>
        <IconButton
          size="md"
          variant="tertiary-dimmed"
          onClick={positionFocalPoint.bind(null, 'right')}
        >
          <AlignmentRight />
        </IconButton>
      </div>
    </div>
  )
}

export default React.memo(FocalPointSelector)
