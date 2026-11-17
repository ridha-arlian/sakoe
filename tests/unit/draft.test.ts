import { describe, expect, it } from 'vitest'
import { parseDraft, serializeDraft } from '@/utils/draft'

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
