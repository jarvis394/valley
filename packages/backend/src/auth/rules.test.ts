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
  it('promotes and approves the first user even in invite mode', () => {
    const access = resolveNewUserAccess({ hasExistingUsers: false, signupMode: 'invite' })

    expect(access.role).toBe('admin')
    expect(access.approvedAt).toBeInstanceOf(Date)
  })

  it('leaves subsequent users pending in invite mode', () => {
    const access = resolveNewUserAccess({ hasExistingUsers: true, signupMode: 'invite' })

    expect(access.role).toBe('user')
    expect(access.approvedAt).toBeNull()
  })

  it('approves subsequent users immediately in open mode', () => {
    const access = resolveNewUserAccess({ hasExistingUsers: true, signupMode: 'open' })

    expect(access.role).toBe('user')
    expect(access.approvedAt).toBeInstanceOf(Date)
  })
})
