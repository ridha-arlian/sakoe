import { describe, expect, it } from 'vitest'
import {
  buildTakoGiftPayload,
  mapTakoStatus,
  takoSignature,
  verifyTakoSignature,
} from '~~/server/utils/tako'

const callbackBody = {
  event: 'payment.success',
  data: {
    id: 'tx-1',
    status: 'success',
    amount: 50000,
    price: 50000,
    paymentMethod: 'qris',
    createdAt: '2026-07-02T10:30:00.000Z',
    relatedGiftId: 'gift-1',
  },
}

describe('mapTakoStatus', () => {
  it('maps success to paid', () => {
    expect(mapTakoStatus('success')).toBe('paid')
  })

  it('maps pending and on_hold to pending', () => {
    expect(mapTakoStatus('pending')).toBe('pending')
    expect(mapTakoStatus('on_hold')).toBe('pending')
  })

  it('maps failed, reversed and refunded', () => {
    expect(mapTakoStatus('failed')).toBe('failed')
    expect(mapTakoStatus('reversed')).toBe('refunded')
    expect(mapTakoStatus('refunded')).toBe('refunded')
  })

  it('returns null for unknown statuses', () => {
    expect(mapTakoStatus('settlement')).toBeNull()
  })
})

describe('takoSignature', () => {
  const secret = 'tako-secret'

  it('matches the pinned hmac fixture', () => {
    expect(takoSignature(callbackBody, secret)).toBe(
      '952dffcdb09a428c1a2f7f9fa2f546659e0aff834f5c7777104e178e4cb74c87',
    )
  })

  it('changes when the secret changes', () => {
    expect(takoSignature(callbackBody, 'other')).not.toBe(takoSignature(callbackBody, secret))
  })

  it('verifies a valid signature and rejects tampering', () => {
    const signature = takoSignature(callbackBody, secret)

    expect(verifyTakoSignature(callbackBody, signature, secret)).toBe(true)
    expect(verifyTakoSignature({ ...callbackBody, event: 'other' }, signature, secret)).toBe(false)
    expect(verifyTakoSignature(callbackBody, `${signature}0`, secret)).toBe(false)
    expect(verifyTakoSignature(callbackBody, '', secret)).toBe(false)
  })
})

describe('buildTakoGiftPayload', () => {
  const base = {
    donorName: 'Alice',
    isAnonymous: false,
    email: 'alice@example.com',
    amount: 25000,
    paymentMethod: 'qris' as const,
    message: 'hi',
  }

  it('never forwards a donor name when anonymous', () => {
    expect(buildTakoGiftPayload({ ...base, isAnonymous: true }).name).toBe('Anonymous')
  })

  it('keeps the name when not anonymous', () => {
    expect(buildTakoGiftPayload(base).name).toBe('Alice')
  })

  it('falls back to Anonymous when the name is empty', () => {
    expect(buildTakoGiftPayload({ ...base, donorName: null }).name).toBe('Anonymous')
  })

  it('uses the amount and email unchanged', () => {
    const payload = buildTakoGiftPayload(base)

    expect(payload.amount).toBe(25000)
    expect(payload.email).toBe('alice@example.com')
  })

  it('omits the message field when there is no message', () => {
    expect(buildTakoGiftPayload({ ...base, message: null }).message).toBeUndefined()
  })
})
