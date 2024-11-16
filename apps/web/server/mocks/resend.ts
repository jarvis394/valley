import { faker } from '@faker-js/faker'
import { HttpResponse, http, type HttpHandler } from 'msw'
import { requireHeader } from './utils.js'
import { z } from 'zod'

const { json } = HttpResponse

export const EmailSchema = z.object({
  to: z.string(),
  from: z.string(),
  subject: z.string(),
  text: z.string(),
  html: z.string(),
})

export const handlers: HttpHandler[] = [
  http.post('https://api.resend.com/emails', async ({ request }) => {
    requireHeader(request.headers, 'Authorization')
    const body = await request.json()
    console.info('🔶 [mock] Received email:', body)

    const email = EmailSchema.parse(body)

    return json({
      id: faker.string.uuid(),
      from: email.from,
      to: email.to,
      created_at: new Date().toISOString(),
    })
  }),
]
