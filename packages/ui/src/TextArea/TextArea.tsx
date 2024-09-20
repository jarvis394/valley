import cx from 'classnames'
import React from 'react'
import Paper, { PaperOwnProps } from '../Paper/Paper'
import TextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize'
import styles from './TextArea.module.css'

type TextAreaProps = {
  before?: React.ReactNode
  after?: React.ReactNode
  state?: 'default' | 'error' | 'valid'
  size?: 'md' | 'lg'
  paperProps?: PaperOwnProps & React.ComponentPropsWithoutRef<'div'>
} & Omit<TextareaAutosizeProps, 'size'>

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function InputWithRef(
    {
      className,
      before,
      after,
      paperProps,
      state = 'default',
      size = 'md',
      ...props
    },
    ref
  ) {
    return (
      <Paper
        {...paperProps}
        component="div"
        variant="secondary"
        className={cx(styles.textArea, 'TextArea', paperProps?.className, {
          [styles['textArea--withBefore']]: !!before,
          [styles['textArea--withAfter']]: !!after,
          [styles['textArea--error']]: state === 'error',
          [styles['textArea--valid']]: state === 'valid',
          [styles['textArea--size-md']]: size === 'md',
          [styles['textArea--size-lg']]: size === 'lg',
        })}
      >
        {before && <div className={styles.textArea__before}>{before}</div>}
        <TextareaAutosize
          minRows={3}
          maxRows={8}
          {...props}
          className={cx(styles.textArea__textarea, className)}
          ref={ref}
        />
        {after && <div className={styles.textArea__after}>{after}</div>}
      </Paper>
    )
  }
)

export default TextArea
