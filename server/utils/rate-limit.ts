import { createError, getRequestIP } from 'h3'
import type { H3Event } from 'h3'

export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

interface CloudflareEnv {
  DONATION_LIMIT?: RateLimitBinding
}

interface CloudflareContext {
  cloudflare?: { env?: CloudflareEnv }
  _platform?: { cloudflare?: { env?: CloudflareEnv } }
}

export async function enforceRateLimit(
  binding: RateLimitBinding | undefined,
  key: string,
): Promise<void> {
  if (!binding) {
    return
  }

  const { success } = await binding.limit({ key })

  if (!success) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many donations from this address. Please try again in a minute.',
    })
  }
}

export async function assertWithinRateLimit(event: H3Event): Promise<void> {
  const context = event.context as unknown as CloudflareContext
  const binding =
    context.cloudflare?.env?.DONATION_LIMIT ??
    context._platform?.cloudflare?.env?.DONATION_LIMIT
  const key = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'

  await enforceRateLimit(binding, key)
}
