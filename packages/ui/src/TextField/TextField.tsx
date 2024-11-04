import React, { useId, useMemo } from 'react'
import styles from './TextField.module.css'
import Input, { InputProps } from '../Input/Input'
import InputLabel from '../InputLabel/InputLabel'
import FormControl from '../FormControl/FormControl'
import FormHelperText from '../FormHelperText/FormHelperText'

type TextFieldProps = InputProps & {
  label?: React.ReactElement | string
  helperText?: React.ReactElement | string
  validHelperText?: React.ReactElement | string
  errorHelperText?: React.ReactElement | string
  fieldState?: { errors?: string[]; valid: boolean; dirty: boolean }
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      helperText,
      validHelperText,
      errorHelperText,
      state: propsState,
      fieldState: propsFieldState,
      id: propsId,
      ...props
    },
    ref
  ) {
    const innerId = useId()
    const fieldState = useMemo(() => {
      if (!propsFieldState?.dirty) return 'default'
      if (propsFieldState?.errors) {
        return 'error'
      } else if (propsFieldState?.valid) {
        return 'valid'
      } else return 'default'
    }, [propsFieldState])
    const state = propsState || fieldState
    const id = useMemo(() => propsId || innerId, [innerId, propsId])
    const shouldRenderHelperText = useMemo(() => {
      if (!helperText) return false
      if (state === 'default') return true
      if (state === 'error' && !errorHelperText) return true
      if (state === 'valid' && !validHelperText) return true
      return true
    }, [errorHelperText, helperText, state, validHelperText])

    return (
      <FormControl state={state} className={styles.textField}>
        {label && (
          <InputLabel htmlFor={id} id={id + '-label'}>
            {label}
          </InputLabel>
        )}
        <Input ref={ref} id={id} {...props} />
        {shouldRenderHelperText && (
          <FormHelperText>{helperText}</FormHelperText>
        )}
        {state === 'error' && errorHelperText && (
          <FormHelperText>{errorHelperText}</FormHelperText>
        )}
        {state === 'valid' && validHelperText && (
          <FormHelperText>{validHelperText}</FormHelperText>
        )}
      </FormControl>
    )
  }
)

export default TextField
