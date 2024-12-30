import React, { useEffect, useRef, useState } from 'react'
import { HTMLMotionProps, motion, TargetAndTransition } from 'framer-motion'
import cx from 'classnames'
import styles from './AnimateChangeInHeight.module.css'

type AnimateChangeInHeightProps = React.PropsWithChildren<{
  className?: string
  target?: HTMLElement | null
  animate?: TargetAndTransition
}> &
  Omit<HTMLMotionProps<'div'>, 'animate'>

const AnimateChangeInHeight: React.FC<AnimateChangeInHeightProps> = ({
  className,
  children,
  target,
  style,
  animate,
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
      className={cx(styles.animateChangeInHeight, className)}
      style={{ ...style, height }}
      animate={{ ...animate, height }}
      transition={{ duration: 0.2, ease: 'circOut' }}
      {...props}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  )
}

export default AnimateChangeInHeight
