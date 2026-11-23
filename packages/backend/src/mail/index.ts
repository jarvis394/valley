export interface Mail {
  to: string
  subject: string
  html: string
  text: string
}

export interface Mailer {
  send(mail: Mail): Promise<void>
}

/**
 * Sends through Resend when an API key is configured. Without one, logs mail text so
 * local development needs no external mail account.
 */
export const createMailer = ({ apiKey, from }: { apiKey?: string; from: string }): Mailer =>
  apiKey ? createResendMailer(apiKey, from) : createLogMailer()

const createResendMailer = (apiKey: string, from: string): Mailer => ({
  async send(mail) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, ...mail }),
    })
    if (!response.ok) {
      throw new Error(`Resend answered ${response.status}: ${await response.text()}`)
    }
  },
})

const createLogMailer = (): Mailer => ({
  async send(mail) {
    console.info(`[mail:dev] to=${mail.to} subject=${JSON.stringify(mail.subject)}\n${mail.text}`)
  },
})

export * from './templates'
