import React from 'react'
import cx from 'classnames'
import styles from './OTPInput.module.css'
import {
  OTPInput as Root,
  OTPInputContext,
  REGEXP_ONLY_DIGITS_AND_CHARS,
  type OTPInputProps,
} from 'input-otp'
import Stack from '../Stack/Stack'

export const OTPInputGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <Stack
    ref={ref}
    className={cx(styles.otpInputGroup, className)}
    align={'center'}
    {...props}
  />
))
OTPInputGroup.displayName = 'OTPInputGroup'

export const OTPInputSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const slot = inputOTPContext.slots[index]
  if (!slot) throw new Error('Invalid slot index')
  const { char, hasFakeCaret, isActive } = slot

  return (
    <div
      ref={ref}
      className={cx(styles.otpInputSlot, className, {
        [styles['otpInputSlot--active']]: isActive,
      })}
      {...props}
    >
      {char}
      {hasFakeCaret && <span className={styles.otpInputFakeCaret} />}
    </div>
  )
})
OTPInputSlot.displayName = 'OTPInputSlot'

export const OTPInputSeparator = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <span
    ref={ref}
    className={styles.otpInputSeparator}
    role="separator"
    {...props}
  />
))
OTPInputSeparator.displayName = 'OTPInputSeparator'

const OTPInput = React.forwardRef<
  React.ElementRef<typeof Root>,
  {
    inputProps?: Partial<OTPInputProps & { render: never }>
    errors?: Array<string | null | undefined> | null
    className?: string
  }
>(({ inputProps, errors, className, ...props }, ref) => {
  const fallbackId = React.useId()
  const id = inputProps?.id ?? fallbackId
  const errorId = errors?.length ? `${id}-error` : undefined

  return (
    <Root
      {...props}
      {...inputProps}
      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      maxLength={6}
      id={id}
      aria-invalid={errorId ? true : undefined}
      aria-describedby={errorId}
      ref={ref}
      containerClassName={styles.otpInput}
      className={className}
    >
      <OTPInputGroup>
        <OTPInputSlot index={0} />
        <OTPInputSlot index={1} />
        <OTPInputSlot index={2} />
      </OTPInputGroup>
      <OTPInputSeparator />
      <OTPInputGroup>
        <OTPInputSlot index={3} />
        <OTPInputSlot index={4} />
        <OTPInputSlot index={5} />
      </OTPInputGroup>
    </Root>
  )
})
OTPInput.displayName = 'OTPInput'

export default React.memo(OTPInput)
