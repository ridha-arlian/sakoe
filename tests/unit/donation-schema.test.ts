import { describe, expect, it } from 'vitest'
import { parseDonationInput } from '~~/server/utils/donation-schema'

function accepted(input: unknown) {
  const result = parseDonationInput(input)
  if (!result.ok) throw new Error(`expected success, got ${JSON.stringify(result.errors)}`)
  return result.value
}

describe('parseDonationInput', () => {
  it('accepts the minimum amount', () => {
    expect(accepted({ amount: 10000 }).amount).toBe(10000)
  })

  it('rejects 9999', () => {
    expect(parseDonationInput({ amount: 9999 }).ok).toBe(false)
  })

  it('accepts numeric strings', () => {
    expect(accepted({ amount: '25000' }).amount).toBe(25000)
  })

  it('rejects floats, non-numeric strings and scientific notation', () => {
    expect(parseDonationInput({ amount: 10000.5 }).ok).toBe(false)
    expect(parseDonationInput({ amount: 'abc' }).ok).toBe(false)
    expect(parseDonationInput({ amount: '1e9' }).ok).toBe(false)
  })

  it('rejects amounts above the maximum', () => {
    expect(parseDonationInput({ amount: 1000000001 }).ok).toBe(false)
  })

  it('trims the name and nulls whitespace-only values', () => {
    expect(accepted({ amount: 10000, donorName: '  Alice  ' }).donorName).toBe('Alice')
    expect(accepted({ amount: 10000, donorName: '   ' }).donorName).toBeNull()
    expect(accepted({ amount: 10000 }).donorName).toBeNull()
  })

  it('rejects names over 50 characters and messages over 200', () => {
    expect(parseDonationInput({ amount: 10000, donorName: 'a'.repeat(51) }).ok).toBe(false)
    expect(parseDonationInput({ amount: 10000, message: 'a'.repeat(201) }).ok).toBe(false)
  })
})
