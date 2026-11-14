import { describe, expect, it } from 'vitest'
import {
  isNotificationApplicable,
  mapMidtransStatus,
  midtransSignature,
  verifyMidtransSignature,
} from '~~/server/utils/midtrans'

describe('mapMidtransStatus', () => {
  it('maps settlement to paid', () => {
    expect(mapMidtransStatus('settlement')).toBe('paid')
  })

  it('maps capture by fraud status', () => {
    expect(mapMidtransStatus('capture', 'accept')).toBe('paid')
    expect(mapMidtransStatus('capture', 'challenge')).toBe('failed')
  })

  it('maps expire, cancel, deny and refund', () => {
    expect(mapMidtransStatus('expire')).toBe('expired')
    expect(mapMidtransStatus('cancel')).toBe('cancelled')
    expect(mapMidtransStatus('deny')).toBe('cancelled')
    expect(mapMidtransStatus('refund')).toBe('refunded')
  })

  it('keeps pending pending', () => {
    expect(mapMidtransStatus('pending')).toBe('pending')
  })

  it('returns null for unknown statuses', () => {
    expect(mapMidtransStatus('authorize')).toBeNull()
  })
})

describe('isNotificationApplicable', () => {
  it('refuses to touch an already paid row', () => {
    expect(isNotificationApplicable('paid')).toBe(false)
  })

  it('accepts pending, expired, failed and cancelled rows', () => {
    expect(isNotificationApplicable('pending')).toBe(true)
    expect(isNotificationApplicable('expired')).toBe(true)
    expect(isNotificationApplicable('failed')).toBe(true)
    expect(isNotificationApplicable('cancelled')).toBe(true)
  })
})

describe('midtransSignature', () => {
  const serverKey = 'your-server-key'

  it('matches the pinned sha512 fixture', () => {
    expect(midtransSignature('sakoe-aaaaaaaaaaaa', '200', '10000.00', serverKey)).toBe(
      '5befe256cbc4c51ad846440fef9fafb366d4582920a9fd80bed2e733d5b3c5208b7cf8787a115426eb353b9a7259311d05661e85c916c24ca594f64ef40aacb2',
    )
  })

  it('changes when the server key changes', () => {
    expect(midtransSignature('sakoe-aaaaaaaaaaaa', '200', '10000.00', 'other')).not.toBe(
      midtransSignature('sakoe-aaaaaaaaaaaa', '200', '10000.00', serverKey),
    )
  })

  it('verifies a valid payload and rejects a tampered amount', () => {
    const payload = {
      order_id: 'sakoe-aaaaaaaaaaaa',
      status_code: '200',
      gross_amount: '10000.00',
      signature_key: midtransSignature('sakoe-aaaaaaaaaaaa', '200', '10000.00', serverKey),
    }

    expect(verifyMidtransSignature(payload, serverKey)).toBe(true)
    expect(verifyMidtransSignature({ ...payload, gross_amount: '1.00' }, serverKey)).toBe(false)
    expect(verifyMidtransSignature({ ...payload, signature_key: `${payload.signature_key}0` }, serverKey)).toBe(false)
  })
})
