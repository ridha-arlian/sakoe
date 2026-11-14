import { describe, expect, it } from 'vitest'
import { buildSnapPayload } from '~~/server/utils/midtrans'

describe('buildSnapPayload', () => {
  it('never forwards a donor name when anonymous', () => {
    const payload = buildSnapPayload(
      { amount: 10000, donorName: 'Alice', message: 'hi', isAnonymous: true },
      'sakoe-aaaaaaaaaaaa',
    )

    expect(payload.customer_details.first_name).toBe('Anonymous')
  })

  it('keeps the name when not anonymous', () => {
    const payload = buildSnapPayload(
      { amount: 10000, donorName: 'Alice', message: null, isAnonymous: false },
      'sakoe-aaaaaaaaaaaa',
    )

    expect(payload.customer_details.first_name).toBe('Alice')
  })

  it('falls back to Anonymous when the name is empty', () => {
    const payload = buildSnapPayload(
      { amount: 10000, donorName: null, message: null, isAnonymous: false },
      'sakoe-aaaaaaaaaaaa',
    )

    expect(payload.customer_details.first_name).toBe('Anonymous')
  })

  it('uses the order amount unchanged', () => {
    const payload = buildSnapPayload(
      { amount: 25000, donorName: null, message: null, isAnonymous: false },
      'sakoe-bbbbbbbbbbbb',
    )

    expect(payload.transaction_details).toEqual({
      order_id: 'sakoe-bbbbbbbbbbbb',
      gross_amount: 25000,
    })
  })

  it('omits the message field when there is no message', () => {
    const payload = buildSnapPayload(
      { amount: 10000, donorName: null, message: null, isAnonymous: false },
      'sakoe-aaaaaaaaaaaa',
    )

    expect(payload.custom_field1).toBeUndefined()
  })
})
