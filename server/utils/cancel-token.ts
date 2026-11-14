import crypto from 'node:crypto'

export function signCancelToken(orderId: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(orderId).digest('hex')
}

export function verifyCancelToken(orderId: string, token: string, secret: string): boolean {
  const expected = Buffer.from(signCancelToken(orderId, secret), 'utf8')
  const provided = Buffer.from(token, 'utf8')

  if (expected.length !== provided.length) {
    return false
  }

  return crypto.timingSafeEqual(expected, provided)
}
