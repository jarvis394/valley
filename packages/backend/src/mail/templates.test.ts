import { describe, expect, it } from 'bun:test'
import {
  approvedMail,
  confirmEmailMail,
  escapeHtml,
  resetPasswordMail,
  verifyEmailMail,
} from './templates'

describe('escapeHtml', () => {
  it('escapes special HTML characters', () => {
    expect(escapeHtml(`<script>"a&b'c"</script>`)).toBe(
      '&lt;script&gt;&quot;a&amp;b&#39;c&quot;&lt;/script&gt;',
    )
  })
})

describe('mail templates', () => {
  it('tailors verifyEmailMail copy to invite-only vs open mode and escapes the URL', () => {
    const url = 'https://valley.example/api/auth/verify?token=a&b=1'
    const invite = verifyEmailMail({ to: 'alex@example.com', url, inviteOnly: true })
    const open = verifyEmailMail({ to: 'alex@example.com', url, inviteOnly: false })

    expect(invite.text).toContain('An admin approves new accounts')
    expect(open.text).not.toContain('An admin approves new accounts')
    expect(invite.html).toContain('https://valley.example/api/auth/verify?token=a&amp;b=1')
    expect(invite.text).toContain(url)
  })

  it('formats confirmEmailMail for adding vs changing an address', () => {
    const addMail = confirmEmailMail({
      to: 'a@b.com',
      url: 'https://valley.example/confirm?token=1',
      adding: true,
      expiresInHours: 1,
    })
    const changeMail = confirmEmailMail({
      to: 'a@b.com',
      url: 'https://valley.example/confirm?token=2',
      adding: false,
      expiresInHours: 2,
    })

    expect(addMail.subject).toBe('Confirm your Valley email')
    expect(addMail.text).toContain('1 hour.')
    expect(changeMail.subject).toBe('Confirm your new Valley email')
    expect(changeMail.text).toContain('2 hours.')
  })

  it('formats resetPasswordMail and approvedMail with action URLs', () => {
    const reset = resetPasswordMail({
      to: 'a@b.com',
      url: 'https://valley.example/reset-password?token=xyz',
      expiresInHours: 1,
    })
    const approved = approvedMail({ to: 'a@b.com', url: 'https://valley.example' })

    expect(reset.html).toContain('https://valley.example/reset-password?token=xyz')
    expect(reset.text).toContain('Reset your password')
    expect(approved.html).toContain('https://valley.example')
    expect(approved.subject).toBe('Your Valley account is approved')
  })
})
