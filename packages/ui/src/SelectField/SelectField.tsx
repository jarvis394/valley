import React, { useId, useMemo, useState } from 'react'
import styles from './SelectField.module.css'
import cx from 'classnames'
import { FormControl } from '../FormControl'
import Select, { SelectRootProps } from '../Select/Select'
import Label from '../Label/Label'
import FormHelperText, {
  FormHelperTextProps,
} from '../FormHelperText/FormHelperText'
import { FieldError } from 'react-hook-form'

export type SelectFieldProps = SelectRootProps & {
  fullWidth?: boolean
  label?: React.ReactElement | string
  helperText?: React.ReactElement | string
  validHelperText?: React.ReactElement | string
  formHelperTextProps?: FormHelperTextProps
  fieldState?: {
    invalid: boolean
    isDirty: boolean
    isTouched: boolean
    isValidating: boolean
    error?: FieldError
  }
}

const SelectField: React.FC<SelectFieldProps> = ({
  state: propsState,
  fullWidth,
  label,
  required,
  id: propsId,
  formHelperTextProps,
  fieldState: propsFieldState,
  helperText,
  validHelperText,
  onFocus: propsOnFocus,
  onBlur: propsOnBlur,
  children,
  ref,
  ...props
}) => {
  const [focused, setFocused] = useState(false)
  const innerId = useId()
  const id = useMemo(() => propsId || innerId, [innerId, propsId])
  const fieldState = useMemo(() => {
    if (!propsFieldState?.invalid && propsFieldState?.isDirty) return 'valid'
    if (focused && helperText) return 'default'
    if (propsFieldState?.invalid && propsFieldState.isTouched) return 'error'
    return 'default'
  }, [
    focused,
    helperText,
    propsFieldState?.invalid,
    propsFieldState?.isDirty,
    propsFieldState?.isTouched,
  ])
  const state = propsState || fieldState
  const shouldShowPropsHelperText = useMemo(() => {
    if (!helperText) return false
    if (state === 'default') return true
    if (state === 'valid' && !validHelperText) return false
    return false
  }, [helperText, state, validHelperText])
  const shouldShowErrorMessage = state === 'error' && propsFieldState?.error
  const shouldShowValidMessage = state === 'valid' && validHelperText

  const onFocus: React.FocusEventHandler<HTMLSelectElement> = (e) => {
    setFocused(true)
    propsOnFocus?.(e)
  }

  const onBlur: React.FocusEventHandler<HTMLSelectElement> = (e) => {
    setFocused(false)
    propsOnBlur?.(e)
  }

  return (
    <FormControl
      state={state}
      className={cx(styles.selectField, {
        [styles['selectField--fullWidth']]: fullWidth,
      })}
    >
      {label && (
        <Label size={'lg'} required={required} htmlFor={id} id={id + '-label'}>
          {label}
        </Label>
      )}

      <Select.Root
        {...props}
        aria-invalid={propsFieldState?.error ? 'true' : 'false'}
        ref={ref}
        id={id}
        required={required}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {children}
      </Select.Root>

      <FormHelperText {...formHelperTextProps}>
        {shouldShowPropsHelperText && helperText}
        {shouldShowErrorMessage && propsFieldState?.error?.message}
        {shouldShowValidMessage && validHelperText}
      </FormHelperText>
    </FormControl>
  )
}

export default SelectField
