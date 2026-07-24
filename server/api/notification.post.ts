import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { order_id, status_code, gross_amount, signature_key, transaction_status, transaction_id, payment_type, fraud_status } = body

  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${config.midtransServerKey}`)
    .digest('hex')

  if (signature_key !== expectedSignature) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid signature' })
  }

  let status: 'pending' | 'paid' | 'expired' | 'failed' | 'cancelled' = 'pending'

  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    status = fraud_status === 'accept' || !fraud_status ? 'paid' : 'failed'
  } else if (transaction_status === 'expire') {
    status = 'expired'
  } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
    status = 'cancelled'
  }

  try {
    await prisma.donation.update({
      where: { orderId: order_id },
      data: {
        status,
        paymentMethod: payment_type,
        midtransTransactionId: transaction_id,
        paidAt: status === 'paid' ? new Date() : undefined,
        rawNotification: body,
        signatureVerified: true,
      },
    })
  } catch (err: any) {
    if (err?.code === 'P2025') {
      throw createError({ statusCode: 404, statusMessage: 'Order ID tidak ditemukan' })
    }
    throw err
  }

  return { message: 'OK' }
})