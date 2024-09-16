import React, { useMemo } from 'react'
import styles from './Note.module.css'
import cx from 'classnames'
import { Information, CheckCircle, Warning, Stop } from 'geist-ui-icons'
import { exhaustivnessCheck } from '@valley/shared'

type NoteProps = React.PropsWithChildren<
  Partial<{
    variant:
      | 'default'
      | 'secondary'
      | 'tertiary'
      | 'warning'
      | 'success'
      | 'alert'
      | 'error'
      | 'violet'
      | 'cyan'
    label: JSX.Element
    fill: boolean
    action: JSX.Element
  }>
> &
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const Note: React.FC<NoteProps> = ({
  children,
  label,
  variant = 'default',
  fill,
  action,
  className,
  ...props
}) => {
  const defaultLabel = useMemo(() => {
    switch (variant) {
      case 'warning':
        return <Warning />
      case 'error':
        return <Stop />
      case 'success':
        return <CheckCircle />
      case 'secondary':
      case 'tertiary':
      case 'alert':
      case 'violet':
      case 'cyan':
      case 'default':
        return <Information />
      default:
        return exhaustivnessCheck(variant)
    }
  }, [variant])

  return (
    <div
      className={cx(styles.note, className, {
        [styles['note--default']]: variant === 'default',
        [styles['note--secondary']]: variant === 'secondary',
        [styles['note--error']]: variant === 'error',
        [styles['note--success']]: variant === 'success',
        [styles['note--tertiary']]: variant === 'tertiary',
        [styles['note--warning']]: variant === 'warning',
        [styles['note--cyan']]: variant === 'cyan',
        [styles['note--violet']]: variant === 'violet',
        [styles['note--alert']]: variant === 'alert',
        [styles['note--filled']]: fill,
        [styles['note--withAction']]: !!action,
      })}
      {...props}
    >
      <div
        className={cx(styles.note__content, {
          [styles['note__content--iconLabel']]: !label,
        })}
      >
        <span className={styles.note__label}>{label || defaultLabel}</span>
        {children}
      </div>
      {action}
    </div>
  )
}

export default React.memo(Note)
