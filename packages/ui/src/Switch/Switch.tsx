import React, { useEffect, useState } from 'react'
import styles from './Switch.module.css'
import cx from 'classnames'

export type SwitchProps = React.InputHTMLAttributes<HTMLInputElement>

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    defaultChecked,
    className,
    checked: propsChecked,
    onChange: propsOnChange,
    ...props
  },
  ref
) {
  const [checked, setChecked] = useState(defaultChecked)

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    propsOnChange?.(e)
    setChecked(e.target.checked)
  }

  useEffect(() => {
    propsChecked !== undefined && setChecked(propsChecked)
  }, [propsChecked])

  return (
    <label
      className={cx(styles.switch, className, {
        [styles['switch--checked']]: checked,
      })}
    >
      <span className={styles.switch__handle} />
      <input
        defaultChecked={defaultChecked}
        className={styles.switch__input}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        {...props}
        ref={ref}
        onChange={handleChange}
      />
    </label>
  )
})

export default Switch
