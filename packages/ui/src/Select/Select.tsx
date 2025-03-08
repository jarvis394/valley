import React from 'react'
import styles from './Select.module.css'
import cx from 'classnames'
import Paper from '../Paper/Paper'
import { ChevronDown } from 'geist-ui-icons'
import { FormControlState } from '../FormControl'

export type SelectRootProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> & {
  state?: FormControlState['state']
  containerProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
}

export const Root: React.FC<SelectRootProps> = ({
  children,
  className,
  containerProps,
  state,
  ...props
}) => {
  return (
    <div
      {...containerProps}
      className={cx(styles.select, containerProps?.className, {
        [styles['select--valid']]: state === 'valid',
        [styles['select--error']]: state === 'error',
      })}
    >
      <Paper variant="secondary" rounded asChild>
        <select {...props} className={cx(styles.select__select, className)}>
          {children}
        </select>
      </Paper>
      <ChevronDown className={styles.select__icon} />
    </div>
  )
}

export type SelectItemProps = React.DetailedHTMLProps<
  React.OptionHTMLAttributes<HTMLOptionElement>,
  HTMLOptionElement
>

export const Item: React.FC<SelectItemProps> = ({
  children,
  className,
  value,
  ...props
}) => {
  return (
    <option {...props} className={cx(styles.select, className)} value={value}>
      {children}
    </option>
  )
}

export default { Root, Item }
