import { createError, getHeader, getRequestIP } from 'h3'
import type { H3Event } from 'h3'

export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

interface CloudflareEnv {
  DONATION_LIMIT?: RateLimitBinding
  STATUS_LIMIT?: RateLimitBinding
}

interface CloudflareContext {
  cloudflare?: { env?: CloudflareEnv }
  _platform?: { cloudflare?: { env?: CloudflareEnv } }
}

function rateLimitBinding(event: H3Event, name: keyof CloudflareEnv): RateLimitBinding | undefined {
  const context = event.context as unknown as CloudflareContext

  return (
    context.cloudflare?.env?.[name] ??
    context._platform?.cloudflare?.env?.[name]
  )
}

function rateLimitKey(event: H3Event): string {
  return (
    getHeader(event, 'cf-connecting-ip') ??
    getRequestIP(event, { xForwardedFor: true }) ??
    'unknown'
  )
}

export async function enforceRateLimit(
  binding: RateLimitBinding | undefined,
  key: string,
  message = 'Too many donations from this address. Please try again in a minute.',
): Promise<void> {
  if (!binding) {
    return
  }

  const { success } = await binding.limit({ key })

  if (!success) {
    throw createError({
      statusCode: 429,
      statusMessage: message,
    })
  }
}

export async function assertWithinRateLimit(event: H3Event): Promise<void> {
  await enforceRateLimit(rateLimitBinding(event, 'DONATION_LIMIT'), rateLimitKey(event))
}

export async function assertWithinStatusRateLimit(event: H3Event): Promise<void> {
  await enforceRateLimit(
    rateLimitBinding(event, 'STATUS_LIMIT'),
    rateLimitKey(event),
    'Too many status checks from this address. Please try again in a minute.',
  )
}
