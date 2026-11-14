import { describe, expect, it, vi } from 'vitest'
import { enforceRateLimit } from '~~/server/utils/rate-limit'

describe('enforceRateLimit', () => {
  it('allows when no binding exists', async () => {
    await expect(enforceRateLimit(undefined, '1.2.3.4')).resolves.toBeUndefined()
  })

  it('allows when the binding accepts', async () => {
    const limit = vi.fn().mockResolvedValue({ success: true })

    await expect(enforceRateLimit({ limit }, '1.2.3.4')).resolves.toBeUndefined()
    expect(limit).toHaveBeenCalledWith({ key: '1.2.3.4' })
  })

  it('throws 429 when the binding refuses', async () => {
    const limit = vi.fn().mockResolvedValue({ success: false })

    await expect(enforceRateLimit({ limit }, '1.2.3.4')).rejects.toMatchObject({
      statusCode: 429,
    })
  })
})
