import { z } from 'zod'
import parsePhoneNumberFromString from 'libphonenumber-js'

export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 20
export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 96

export const UsernameSchema = z
  .string({ required_error: 'Username is required' })
  .min(USERNAME_MIN_LENGTH, { message: 'Username is too short' })
  .max(USERNAME_MAX_LENGTH, { message: 'Username is too long' })
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only include letters, numbers, and underscores',
  })
  // users can type the username in any case, but we store it in lowercase
  .transform((value) => value.toLowerCase())

const passwordMinLengthError = `Your password must contain ${PASSWORD_MIN_LENGTH} or more characters`
export const PasswordSchema = z
  .string({
    required_error: passwordMinLengthError,
  })
  .min(PASSWORD_MIN_LENGTH, {
    message: passwordMinLengthError,
  })
  .max(PASSWORD_MAX_LENGTH, { message: 'Password is too long' })
export const NameSchema = z
  .string({ required_error: 'Field is required' })
  .min(3, { message: 'Value is too short' })
  .max(40, { message: 'Value is too long' })
export const EmailSchema = z
  .string({ required_error: 'Email is required' })
  .email({ message: 'Email is invalid' })
  .min(3, { message: 'Email is too short' })
  .max(100, { message: 'Email is too long' })
  // users can type the email in any case, but we store it in lowercase
  .transform((value) => value.toLowerCase())

export const PhoneSchema = z.string().transform((arg, ctx) => {
  const phone = parsePhoneNumberFromString(arg, {
    defaultCountry: 'RU',
    // Set to false to require that the whole string is exactly a phone number,
    // otherwise, it will search for a phone number anywhere within the string
    extract: false,
  })

  if (phone && phone.isValid()) {
    return phone.number
  }

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: 'Invalid phone number',
  })
  return z.NEVER
})
