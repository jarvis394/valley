/* eslint-disable jsx-a11y/autocomplete-valid */
import React, { JSX } from 'react'
import { useRemixFormContext } from 'remix-hook-form'
import { type HoneypotInputProps } from 'remix-utils/honeypot/server'

type HoneypotContextType = Partial<HoneypotInputProps>

const HoneypotContext = React.createContext<HoneypotContextType>({})

/**
 * Honeypot inputs for form validation
 *
 * WARNING: use with <RemixFormProvider> in parent tree
 */
export function HoneypotInputs({
  label = 'Please leave this field blank',
}: {
  label?: string
}): JSX.Element {
  const methods = useRemixFormContext()
  const {
    nameFieldName = 'name__confirm',
    validFromFieldName,
    encryptedValidFrom,
  } = React.useContext(HoneypotContext)
  const nameFieldProps = methods?.register(nameFieldName) || {}
  const validFromFieldProps =
    methods?.register(validFromFieldName || 'from__confirm', {
      value: encryptedValidFrom,
    }) || {}

  return (
    <div
      id={`${nameFieldName}_wrap`}
      style={{ display: 'none' }}
      aria-hidden="true"
    >
      <label htmlFor={nameFieldName}>{label}</label>
      <input
        {...nameFieldProps}
        id={nameFieldName}
        type="text"
        defaultValue=""
        autoComplete={'nope'}
        tabIndex={-1}
      />
      {validFromFieldName && encryptedValidFrom ? (
        <>
          <label htmlFor={validFromFieldName}>{label}</label>
          <input
            {...validFromFieldProps}
            id={validFromFieldName}
            type="text"
            readOnly
            autoComplete="off"
            tabIndex={-1}
          />
        </>
      ) : null}
    </div>
  )
}

export type HoneypotProviderProps = HoneypotContextType & {
  children: React.ReactNode
}

export function HoneypotProvider({
  children,
  ...context
}: HoneypotProviderProps) {
  return (
    <HoneypotContext.Provider value={context}>
      {children}
    </HoneypotContext.Provider>
  )
}
