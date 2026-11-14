import crypto from 'node:crypto'
import type { DonationInput } from './donation-schema'

export type DbStatus =
  | 'pending'
  | 'paid'
  | 'expired'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export interface MidtransNotificationPayload {
  order_id: string
  status_code: string
  gross_amount: string
  signature_key: string
}

export interface SnapPayload {
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  credit_card: {
    secure: boolean
  }
  customer_details: {
    first_name: string
  }
  custom_field1?: string
}

export function buildSnapPayload(input: DonationInput, orderId: string): SnapPayload {
  const payload: SnapPayload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: input.amount,
    },
    credit_card: { secure: true },
    customer_details: {
      first_name: input.isAnonymous ? 'Anonymous' : (input.donorName ?? 'Anonymous'),
    },
  }

  if (input.message) {
    payload.custom_field1 = input.message
  }

  return payload
}

export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string,
): DbStatus | null {
  switch (transactionStatus) {
    case 'settlement':
      return 'paid'
    case 'capture':
      return !fraudStatus || fraudStatus === 'accept' ? 'paid' : 'failed'
    case 'pending':
      return 'pending'
    case 'expire':
      return 'expired'
    case 'cancel':
    case 'deny':
      return 'cancelled'
    case 'refund':
    case 'partial_refund':
      return 'refunded'
    default:
      return null
  }
}

export function isNotificationApplicable(existingStatus: string): boolean {
  return existingStatus !== 'paid'
}

export function midtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
): string {
  return crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex')
}

export function verifyMidtransSignature(
  payload: MidtransNotificationPayload,
  serverKey: string,
): boolean {
  const expected = Buffer.from(
    midtransSignature(payload.order_id, payload.status_code, payload.gross_amount, serverKey),
    'utf8',
  )
  const provided = Buffer.from(String(payload.signature_key ?? ''), 'utf8')

  if (expected.length !== provided.length) {
    return false
  }

  return crypto.timingSafeEqual(expected, provided)
}
