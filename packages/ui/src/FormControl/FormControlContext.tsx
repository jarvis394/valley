import * as React from 'react'

export interface FormControlState {
  state: 'default' | 'error' | 'valid'
}

const FormControlContext = React.createContext<FormControlState | undefined>(
  undefined
)

export const useFormControl = () => {
  const state = React.useContext(FormControlContext)
  return state
}

export default FormControlContext
