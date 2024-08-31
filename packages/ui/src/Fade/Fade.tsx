import React from 'react'
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion'

type FadeProps = {
  children: React.ReactNode
  in?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: any
  onEnter?: (node: HTMLElement, isAppearing: boolean) => void
  onExited?: (node: HTMLElement, isAppearing: boolean) => void
} & HTMLMotionProps<'div'>

const Fade = React.forwardRef<HTMLDivElement, FadeProps>(function Fade(
  { children, in: open, onEnter, onExited, initial, animate, exit, ...props },
  ref
) {
  return (
    <AnimatePresence
      onExitComplete={() => {
        if (!open && onExited) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onExited(null as any, true)
        }
      }}
    >
      {open && (
        <motion.div
          {...props}
          ref={ref}
          initial={{ ...(typeof initial === 'object' && initial), opacity: 0 }}
          animate={{ ...(typeof animate === 'object' && animate), opacity: 1 }}
          exit={{ ...(typeof exit === 'object' && exit), opacity: 0 }}
          onAnimationStart={() => {
            if (open && onEnter) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onEnter(null as any, true)
            }
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export default Fade
