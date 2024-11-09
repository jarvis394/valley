import React, { useEffect, useState } from 'react'
import styles from './FormCollapsibleField.module.css'
import Switch from '@valley/ui/Switch'
import AnimateChangeInHeight from '@valley/ui/AnimateChangeInHeight'
import { motion } from 'framer-motion'

export type CollapsibleState = 'collapsed' | 'expanded'
export type FormCollapsibleFieldProps = React.PropsWithChildren<{
  label?: string
  state?: CollapsibleState
  defaultState?: CollapsibleState
}> &
  React.InputHTMLAttributes<HTMLInputElement>

const TRIGGER_HEIGHT = 56

const FormCollapsibleField = React.forwardRef<
  HTMLInputElement,
  FormCollapsibleFieldProps
>(function FormCollapsibleField(
  {
    state: propsState,
    defaultState = 'collapsed',
    label,
    children,
    onChange: propsOnChange,
    id,
    ...props
  },
  ref
) {
  const [state, setState] = useState(propsState || defaultState)
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    propsOnChange?.(e)
    setState(e.currentTarget.checked ? 'expanded' : 'collapsed')
  }

  useEffect(() => {
    propsState && setState(propsState)
  }, [propsState])

  return (
    <motion.div
      style={{ height: TRIGGER_HEIGHT }}
      animate={{ height: state === 'expanded' ? 'auto' : TRIGGER_HEIGHT }}
      transition={{ duration: 0.5, ease: [0.62, 0, 0, 1] }}
      className={styles.formCollapsibleField}
      data-state={state}
    >
      <AnimateChangeInHeight>
        <label htmlFor={id} className={styles.formCollapsibleField__trigger}>
          {label}
          <Switch
            {...props}
            defaultChecked={defaultState === 'expanded'}
            checked={state === 'expanded'}
            id={id}
            onChange={handleChange}
            ref={ref}
          />
        </label>
        <div className={styles.formCollapsibleField__content}>{children}</div>
      </AnimateChangeInHeight>
    </motion.div>
  )
})

export default FormCollapsibleField
