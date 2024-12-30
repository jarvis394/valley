import { FieldValues } from 'react-hook-form'
import { Honeypot, SpamError } from 'remix-utils/honeypot/server'

export const honeypot = new Honeypot({
  validFromFieldName: process.env.NODE_ENV === 'test' ? null : undefined,
  encryptionSeed: process.env.HONEYPOT_SECRET,
  randomizeNameFieldName: true,
})

export function checkHoneypot(fields: FieldValues) {
  const formData = new FormData()

  for (const key in fields) {
    formData.append(key, fields[key])
  }

  try {
    honeypot.check(formData)
  } catch (error) {
    if (error instanceof SpamError) {
      throw new Response('Form was not submitted properly', { status: 400 })
    }
    throw error
  }
}
