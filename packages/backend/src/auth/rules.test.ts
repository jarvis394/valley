import { describe, expect, it } from 'bun:test'
import { isApproved, resolveNewUserAccess } from './rules'

describe('isApproved', () => {
  it('always approves admins regardless of approvedAt', () => {
    expect(isApproved({ role: 'admin', approvedAt: null })).toBe(true)
    expect(isApproved({ role: 'admin' })).toBe(true)
  })

  it('requires approvedAt for regular users', () => {
    expect(isApproved({ role: 'user', approvedAt: null })).toBe(false)
    expect(isApproved({ role: 'user', approvedAt: new Date() })).toBe(true)
    expect(isApproved({ role: 'user', approvedAt: '2026-01-01T00:00:00Z' })).toBe(true)
  })
})

describe('resolveNewUserAccess', () => {
  it('leaves sign-ups pending in invite mode', () => {
    expect(resolveNewUserAccess('invite')).toEqual({ role: 'user', approvedAt: null })
  })

  it('approves sign-ups immediately in open mode', () => {
    const access = resolveNewUserAccess('open')

    expect(access.role).toBe('user')
    expect(access.approvedAt).toBeInstanceOf(Date)
  })
})
