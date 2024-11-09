import React from 'react'
import styles from './FormHelperText.module.css'
import { useFormControl, FormControlState } from '../FormControl'
import cx from 'classnames'
import InfoCircleFill from '../svg/InfoCircleFill'
import CheckCircleFill from '../svg/CheckCircleFill'
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion'
import AnimateChangeInHeight from '../AnimateChangeInHeight/AnimateChangeInHeight'

export type FormHelperTextProps = React.PropsWithChildren<{
  state?: FormControlState['state']
  animationKey?: string
}> &
  HTMLMotionProps<'p'>

const FormHelperText: React.FC<FormHelperTextProps> = ({
  state: propsState,
  className,
  children,
  animationKey,
  ...props
}) => {
  const formControl = useFormControl()
  const state = propsState || formControl?.state
  const isChildrenEmpty = Array.isArray(children)
    ? children.every((e) => !e)
    : !children

  return (
    <AnimateChangeInHeight>
      <AnimatePresence initial={false} mode="wait">
        {!isChildrenEmpty && (
          <motion.p
            key={animationKey || state}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cx(styles.formHelperText, className, {
              [styles['formHelperText--error']]: state === 'error',
              [styles['formHelperText--valid']]: state === 'valid',
            })}
            {...props}
          >
            {state === 'error' && <InfoCircleFill color="var(--red-700)" />}
            {state === 'valid' && <CheckCircleFill color="var(--green-700)" />}
            <span role={state === 'error' ? 'alert' : 'note'}>{children}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </AnimateChangeInHeight>
  )
}

export default FormHelperText
