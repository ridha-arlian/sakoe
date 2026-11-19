import { describe, expect, it } from 'vitest'
import { parseDonationInput } from '~~/server/utils/donation-schema'

function accepted(input: unknown) {
  const result = parseDonationInput(input)
  if (!result.ok) throw new Error(`expected success, got ${JSON.stringify(result.errors)}`)
  return result.value
}

const email = 'alice@example.com'

describe('parseDonationInput', () => {
  it('accepts the minimum amount', () => {
    expect(accepted({ amount: 10000, email }).amount).toBe(10000)
  })

  it('rejects 9999', () => {
    expect(parseDonationInput({ amount: 9999, email }).ok).toBe(false)
  })

  it('accepts numeric strings', () => {
    expect(accepted({ amount: '25000', email }).amount).toBe(25000)
  })

  it('rejects floats, non-numeric strings and scientific notation', () => {
    expect(parseDonationInput({ amount: 10000.5, email }).ok).toBe(false)
    expect(parseDonationInput({ amount: 'abc', email }).ok).toBe(false)
    expect(parseDonationInput({ amount: '1e9', email }).ok).toBe(false)
  })

  it('rejects amounts above the maximum', () => {
    expect(parseDonationInput({ amount: 50000001, email }).ok).toBe(false)
  })

  it('accepts amounts up to the Tako maximum', () => {
    expect(accepted({ amount: 50000000, email }).amount).toBe(50000000)
  })

  it('trims the name and nulls whitespace-only values', () => {
    expect(accepted({ amount: 10000, email, donorName: '  Alice  ' }).donorName).toBe('Alice')
    expect(accepted({ amount: 10000, email, donorName: '   ' }).donorName).toBeNull()
    expect(accepted({ amount: 10000, email }).donorName).toBeNull()
  })

  it('rejects names over 50 characters and messages over 200', () => {
    expect(parseDonationInput({ amount: 10000, email, donorName: 'a'.repeat(51) }).ok).toBe(false)
    expect(parseDonationInput({ amount: 10000, email, message: 'a'.repeat(201) }).ok).toBe(false)
  })

  it('requires a valid email', () => {
    expect(parseDonationInput({ amount: 10000 }).ok).toBe(false)
    expect(parseDonationInput({ amount: 10000, email: '' }).ok).toBe(false)
    expect(parseDonationInput({ amount: 10000, email: 'not-an-email' }).ok).toBe(false)
    expect(accepted({ amount: 10000, email: '  alice@example.com  ' }).email).toBe('alice@example.com')
  })

  it('defaults the payment method to qris and rejects unknown methods', () => {
    expect(accepted({ amount: 10000, email }).paymentMethod).toBe('qris')
    expect(accepted({ amount: 10000, email, paymentMethod: 'gopay' }).paymentMethod).toBe('gopay')
    expect(parseDonationInput({ amount: 10000, email, paymentMethod: 'ovo' }).ok).toBe(false)
  })

  it('accepts only well-formed previous order ids', () => {
    expect(accepted({ amount: 10000, email, previousOrderId: 'sakoe-0123456789ab' }).previousOrderId)
      .toBe('sakoe-0123456789ab')
    expect(accepted({ amount: 10000, email }).previousOrderId).toBeUndefined()
    expect(parseDonationInput({ amount: 10000, email, previousOrderId: 'sakoe-xyz' }).ok).toBe(false)
    expect(parseDonationInput({ amount: 10000, email, previousOrderId: "sakoe-0123456789ab' OR 1=1" }).ok).toBe(false)
  })
})
