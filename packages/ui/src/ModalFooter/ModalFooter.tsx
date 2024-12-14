import React, { PropsWithoutRef } from 'react'
import styles from './ModalFooter.module.css'
import cx from 'classnames'
import Stack from '../Stack/Stack'

type ModalFooterProps = React.PropsWithChildren<{
  before?: React.ReactElement
  after?: React.ReactElement
}> &
  PropsWithoutRef<React.HTMLAttributes<HTMLDivElement>>

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  function ModalFooter({ before, after, children, className, ...props }, ref) {
    return (
      <Stack
        {...props}
        ref={ref}
        gap={2}
        direction="row"
        justify="space-between"
        align="center"
        padding={4}
        className={cx(styles.modalFooter, className)}
      >
        {before && (
          <Stack align="center" gap={2}>
            {before}
          </Stack>
        )}
        {children}
        {after && (
          <Stack align="center" gap={2}>
            {after}
          </Stack>
        )}
      </Stack>
    )
  }
)

export default ModalFooter
