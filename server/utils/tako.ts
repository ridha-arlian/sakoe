import crypto from 'node:crypto'
import type { TakoPaymentMethod } from '~~/shared/donation'

export type DbStatus =
  | 'pending'
  | 'paid'
  | 'expired'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export const TAKO_API_BASE = 'https://tako.id'

export interface TakoGiftInput {
  donorName: string | null
  isAnonymous: boolean
  email: string
  amount: number
  paymentMethod: TakoPaymentMethod
  message: string | null
}

export interface TakoGiftPayload {
  name: string
  email: string
  amount: number
  paymentMethod: TakoPaymentMethod
  message?: string
}

export interface TakoGiftResponse {
  statusCode: number
  result: {
    success: true
    giftId: string
    transactionId: string
    paymentUrl: string
  }
}

export interface TakoGift {
  id: string
  status: string
  type: string
  amount: number
  message: string | null
  currency: string | null
  gifterName: string
  gifterEmail: string
  createdAt: string
}

export interface TakoCallbackPayload {
  event: string
  data: {
    id: string
    status: string
    amount: number
    price: number
    paymentMethod: string
    paymentUrl?: string
    createdAt: string
    relatedGiftId: string | null
  }
}

export function buildTakoGiftPayload(input: TakoGiftInput): TakoGiftPayload {
  const payload: TakoGiftPayload = {
    name: input.isAnonymous ? 'Anonymous' : (input.donorName || 'Anonymous'),
    email: input.email,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
  }

  if (input.message) {
    payload.message = input.message
  }

  return payload
}

export function mapTakoStatus(status: string): DbStatus | null {
  switch (status) {
    case 'success':
      return 'paid'
    case 'pending':
    case 'on_hold':
      return 'pending'
    case 'failed':
      return 'failed'
    case 'reversed':
    case 'refunded':
      return 'refunded'
    default:
      return null
  }
}

/**
 * Tako signs `JSON.stringify(callbackBody)` with the callback secret.
 * Replicating that serialization matters: the received body may be reparsed
 * before verification, and key order must stay exactly as delivered.
 */
export function takoSignature(body: unknown, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex')
}

export function verifyTakoSignature(body: unknown, provided: string, secret: string): boolean {
  const expected = Buffer.from(takoSignature(body, secret), 'utf8')
  const received = Buffer.from(String(provided ?? ''), 'utf8')

  if (expected.length !== received.length) {
    return false
  }

  return crypto.timingSafeEqual(expected, received)
}

interface TakoRequestConfig {
  apiKey: string
  userAgent: string
}

function takoHeaders(config: TakoRequestConfig): Record<string, string> {
  return {
    accept: 'application/json',
    authorization: `Bearer ${config.apiKey}`,
    'user-agent': config.userAgent,
  }
}

export async function createTakoGift(
  config: TakoRequestConfig & { username: string },
  payload: TakoGiftPayload,
): Promise<TakoGiftResponse['result']> {
  const response = await $fetch<TakoGiftResponse>(
    `${TAKO_API_BASE}/api/v1/gift/${encodeURIComponent(config.username)}`,
    {
      method: 'POST',
      headers: {
        ...takoHeaders(config),
        'content-type': 'application/json',
      },
      body: payload,
      timeout: 10_000,
    },
  )

  return response.result
}

export async function getTakoGift(config: TakoRequestConfig, giftId: string): Promise<TakoGift> {
  const response = await $fetch<{ statusCode: number; result: TakoGift }>(
    `${TAKO_API_BASE}/api/v1/gift/${encodeURIComponent(giftId)}`,
    {
      method: 'GET',
      headers: takoHeaders(config),
      timeout: 2500,
    },
  )

  return response.result
}
