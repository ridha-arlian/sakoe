import { describe, expect, it } from 'vitest'
import { isRecentOrder, parseDraft, parseRedirectFlag, serializeDraft } from '@/utils/draft'

const draft = {
  amount: 25000,
  donorName: 'Alice',
  message: 'hi',
  isAnonymous: false,
  email: 'alice@example.com',
  paymentMethod: 'gopay' as const,
}

describe('draft serialization', () => {
  it('round-trips a draft', () => {
    expect(parseDraft(serializeDraft(draft))).toEqual(draft)
  })

  it('defaults email and payment method for older drafts', () => {
    const { email: _email, paymentMethod: _paymentMethod, ...legacy } = draft

    expect(parseDraft(JSON.stringify(legacy))).toEqual({
      ...legacy,
      email: '',
      paymentMethod: 'qris',
    })
  })

  it('returns null for missing, empty or corrupt input', () => {
    expect(parseDraft(null)).toBeNull()
    expect(parseDraft('')).toBeNull()
    expect(parseDraft('{')).toBeNull()
    expect(parseDraft('{"amount":0}')).toBeNull()
  })

  it('rejects drafts with invalid fields', () => {
    expect(parseDraft(JSON.stringify({ ...draft, amount: 9999 }))).toBeNull()
    expect(parseDraft(JSON.stringify({ ...draft, amount: 10000.5 }))).toBeNull()
    expect(parseDraft(JSON.stringify({ ...draft, amount: 50000001 }))).toBeNull()
    expect(parseDraft(JSON.stringify({ ...draft, donorName: 42 }))).toBeNull()
    expect(parseDraft(JSON.stringify({ ...draft, email: 42 }))).toBeNull()
    expect(parseDraft(JSON.stringify({ ...draft, email: 'a'.repeat(255) }))).toBeNull()
    expect(parseDraft(JSON.stringify({ ...draft, paymentMethod: 'ovo' }))).toBeNull()
    expect(parseDraft(JSON.stringify({ ...draft, isAnonymous: 'yes' }))).toBeNull()
    expect(parseDraft(JSON.stringify({ ...draft, message: 'a'.repeat(201) }))).toBeNull()
  })

  it('serializes null as null', () => {
    expect(serializeDraft(null)).toBeNull()
  })
})

describe('isRecentOrder', () => {
  const now = 1_000_000_000

  it('accepts orders inside the window', () => {
    expect(isRecentOrder(now - 1000, 60_000, now)).toBe(true)
  })

  it('rejects orders past the window', () => {
    expect(isRecentOrder(now - 61_000, 60_000, now)).toBe(false)
  })

  it('rejects missing or corrupt timestamps', () => {
    expect(isRecentOrder(0, 60_000, now)).toBe(false)
    expect(isRecentOrder(Number.NaN, 60_000, now)).toBe(false)
    expect(isRecentOrder(-1, 60_000, now)).toBe(false)
  })
})

describe('parseRedirectFlag', () => {
  it('reads a stored flag', () => {
    expect(parseRedirectFlag(JSON.stringify({ orderId: 'sakoe-0123456789ab', at: 123 }))).toEqual({
      orderId: 'sakoe-0123456789ab',
      at: 123,
    })
  })

  it('rejects empty, corrupt or incomplete flags', () => {
    expect(parseRedirectFlag(null)).toBeNull()
    expect(parseRedirectFlag('')).toBeNull()
    expect(parseRedirectFlag('{')).toBeNull()
    expect(parseRedirectFlag(JSON.stringify({ at: 123 }))).toBeNull()
    expect(parseRedirectFlag(JSON.stringify({ orderId: '', at: 123 }))).toBeNull()
    expect(parseRedirectFlag(JSON.stringify({ orderId: 'sakoe-0123456789ab' }))).toBeNull()
    expect(parseRedirectFlag(JSON.stringify({ orderId: 'sakoe-0123456789ab', at: 'now' }))).toBeNull()
  })
})
