import type { H3Event } from 'h3'
import type { RateLimitBinding } from './rate-limit'

interface D1Result<T> {
  results: T[]
  success: boolean
  meta: {
    changes: number
  }
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>
  run(): Promise<D1Result<Record<string, unknown>>>
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement
}

interface CloudflareContext {
  env?: {
    SAKOE?: D1Database
    DONATION_LIMIT?: RateLimitBinding
  }
}

/**
 * Resolve the D1 binding for the current request.
 * In dev Nitro exposes bindings on `event.context.cloudflare`,
 * while the Workers runtime uses `event.context._platform.cloudflare`.
 */
export function useDB(event: H3Event): D1Database {
  const ctx = event.context as unknown as {
    cloudflare?: CloudflareContext
    _platform?: { cloudflare?: CloudflareContext }
  }

  const db = ctx.cloudflare?.env?.SAKOE ?? ctx._platform?.cloudflare?.env?.SAKOE

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'D1 binding "SAKOE" not available',
    })
  }

  return db
}
