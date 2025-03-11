import { render } from '@react-email/components'
import { type ReactElement } from 'react'
import { z } from 'zod'
import VerifyEmail from '../components/VerifyEmail'

const resendErrorSchema = z.union([
  z.object({
    name: z.string(),
    message: z.string(),
    statusCode: z.number(),
  }),
  z.object({
    name: z.literal('UnknownError'),
    message: z.literal('Unknown Error'),
    statusCode: z.literal(500),
    cause: z.any(),
  }),
])
type ResendError = z.infer<typeof resendErrorSchema>

const resendSuccessSchema = z.object({
  id: z.string(),
})

type SendEmailOptions = {
  subject: string
  to: string
} & (
  | { html: string; text: string; react?: never }
  | { react: ReactElement; html?: never; text?: never }
)

export const sendEmail = async ({ react, ...options }: SendEmailOptions) => {
  // TODO: move out to a env variable
  const from = 'onboarding@resend.dev'

  const email = {
    from,
    ...options,
    ...(react ? await renderReactEmail(react) : null),
  }

  if (!process.env.RESEND_API_KEY && !process.env.MOCKS) {
    console.error('RESEND_API_KEY not set and we are not in mocks mode.')
    console.error(
      'To send emails, set the RESEND_API_KEY environment variable.'
    )
    console.error('Would have sent the following email:', JSON.stringify(email))
    return {
      status: 'success',
      data: { id: 'mocked' },
    } as const
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    body: JSON.stringify(email),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  const parsedData = resendSuccessSchema.safeParse(data)

  if (parsedData.success) {
    return {
      status: 'success',
      data: parsedData,
    } as const
  } else {
    const parseResult = resendErrorSchema.safeParse(data)

    if (parseResult.success) {
      return {
        status: 'error',
        error: parseResult.data,
      } as const
    } else {
      return {
        status: 'error',
        error: {
          name: 'UnknownError',
          message: 'Unknown Error',
          statusCode: 500,
          cause: data,
        } satisfies ResendError,
      } as const
    }
  }
}

type SendAuthEmailOptions = {
  code: string
  email: string
  magicLink?: string | null
}

export const sendAuthEmail = async ({
  code,
  email,
  magicLink,
}: SendAuthEmailOptions) => {
  const subject = 'Your verification code for Valley'
  return await sendEmail({
    react: <VerifyEmail code={code} email={email} magicLink={magicLink} />,
    subject,
    to: email,
  })
}

export const sendRegisterEmail = async ({
  code,
  email,
  magicLink,
}: SendAuthEmailOptions) => {
  const subject = 'Welcome to Valley'
  return await sendEmail({
    react: <VerifyEmail code={code} email={email} magicLink={magicLink} />,
    subject,
    to: email,
  })
}

async function renderReactEmail(react: ReactElement) {
  const [html, text] = await Promise.all([
    render(react),
    render(react, { plainText: true }),
  ])
  return { html, text }
}
