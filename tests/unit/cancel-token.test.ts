import { describe, expect, it } from 'vitest'
import { signCancelToken, verifyCancelToken } from '~~/server/utils/cancel-token'

describe('cancel tokens', () => {
  it('is deterministic for the same order and secret', () => {
    expect(signCancelToken('sakoe-a', 'secret')).toBe(signCancelToken('sakoe-a', 'secret'))
  })

  it('verifies a matching token', () => {
    const token = signCancelToken('sakoe-a', 'secret')

    expect(verifyCancelToken('sakoe-a', token, 'secret')).toBe(true)
  })

  it('rejects another order id, another secret and a tampered token', () => {
    const token = signCancelToken('sakoe-a', 'secret')

    expect(verifyCancelToken('sakoe-b', token, 'secret')).toBe(false)
    expect(verifyCancelToken('sakoe-a', token, 'other')).toBe(false)
    expect(verifyCancelToken('sakoe-a', `${token}0`, 'secret')).toBe(false)
    expect(verifyCancelToken('sakoe-a', '', 'secret')).toBe(false)
  })
})
