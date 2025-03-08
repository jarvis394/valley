import React, { useEffect, useRef, useState } from 'react'
import { HTMLMotionProps, motion, TargetAndTransition } from 'framer-motion'
import cx from 'classnames'
import styles from './AnimateChangeInHeight.module.css'

type AnimateChangeInHeightProps = React.PropsWithChildren<{
  className?: string
  target?: HTMLElement | null
  motionProps?: Omit<HTMLMotionProps<'div'>, 'animate'> & {
    animate?: TargetAndTransition
  }
}>

const AnimateChangeInHeight: React.FC<AnimateChangeInHeightProps> = ({
  children,
  target,
  motionProps,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useEffect(() => {
    if (!containerRef.current && !target) return

    const resizeObserver = new ResizeObserver((entries) => {
      // We only have one entry, so we can use entries[0]
      const observedHeight = entries[0].contentRect.height
      setHeight(observedHeight)
    })

    if (target) {
      resizeObserver.observe(target)
    } else if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    } else return

    return () => {
      resizeObserver.disconnect()
    }
  }, [target])

  return (
    <motion.div
      transition={{ duration: 0.2, ease: 'circOut' }}
      {...motionProps}
      className={cx(styles.animateChangeInHeight, motionProps?.className)}
      style={{ ...motionProps?.style, height }}
      animate={{ ...motionProps?.animate, height }}
    >
      <div {...props} ref={containerRef}>
        {children}
      </div>
    </motion.div>
  )
}

export default AnimateChangeInHeight
