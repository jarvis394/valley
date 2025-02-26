import React, { useId, useMemo, useState } from 'react'
import styles from './TextField.module.css'
import Input, { InputProps } from '../Input/Input'
import InputLabel from '../InputLabel/InputLabel'
import FormControl from '../FormControl/FormControl'
import FormHelperText, {
  FormHelperTextProps,
} from '../FormHelperText/FormHelperText'
import { FieldError } from 'react-hook-form'
import cx from 'classnames'

export type TextFieldProps = InputProps & {
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

const TextField = React.forwardRef(function TextField(
  {
    label,
    helperText,
    validHelperText,
    onFocus: propsOnFocus,
    onBlur: propsOnBlur,
    state: propsState,
    fieldState: propsFieldState,
    id: propsId,
    required,
    size,
    formHelperTextProps,
    fullWidth = true,
    ...props
  }: TextFieldProps,
  ref: React.ForwardedRef<HTMLInputElement>
) {
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

  const onFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(true)
    propsOnFocus?.(e)
  }

  const onBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setFocused(false)
    propsOnBlur?.(e)
  }

  return (
    <FormControl
      state={state}
      className={cx(styles.textField, {
        [styles['textField--fullWidth']]: fullWidth,
      })}
    >
      {label && (
        <InputLabel
          size={size}
          required={required}
          htmlFor={id}
          id={id + '-label'}
        >
          {label}
        </InputLabel>
      )}
      <Input
        {...props}
        size={size}
        aria-invalid={propsFieldState?.error ? 'true' : 'false'}
        ref={ref}
        id={id}
        required={required}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      <FormHelperText {...formHelperTextProps}>
        {shouldShowPropsHelperText && helperText}
        {shouldShowErrorMessage && propsFieldState?.error?.message}
        {shouldShowValidMessage && validHelperText}
      </FormHelperText>
    </FormControl>
  )
})

export default React.memo(TextField)
