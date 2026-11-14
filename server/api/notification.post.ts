export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const config = useRuntimeConfig(event)

  const payload = {
    order_id: String(body?.order_id ?? ''),
    status_code: String(body?.status_code ?? ''),
    gross_amount: String(body?.gross_amount ?? ''),
    signature_key: String(body?.signature_key ?? ''),
  }

  if (!payload.order_id || !payload.signature_key) {
    throw createError({ statusCode: 400, statusMessage: 'order_id and signature_key are required' })
  }

  if (!verifyMidtransSignature(payload, config.midtransServerKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid signature' })
  }

  const db = useDB(event)
  const donation = await db.prepare(
    `SELECT amount, status FROM donations WHERE order_id = ?`
  ).bind(payload.order_id).first<{ amount: number; status: string }>()

  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: 'Order ID not found' })
  }

  if (Number(payload.gross_amount) !== Number(donation.amount)) {
    throw createError({ statusCode: 400, statusMessage: 'Gross amount does not match the donation' })
  }

  if (!isNotificationApplicable(donation.status)) {
    return { message: 'OK' }
  }

  const transactionStatus = String(body?.transaction_status ?? '')
  const fraudStatus = typeof body?.fraud_status === 'string' ? body.fraud_status : undefined
  const nextStatus = mapMidtransStatus(transactionStatus, fraudStatus) ?? 'pending'
  const paymentMethod = typeof body?.payment_type === 'string' ? body.payment_type : null
  const transactionId = typeof body?.transaction_id === 'string' ? body.transaction_id : null
  const now = Date.now()

  await db.prepare(
    `UPDATE donations
     SET status = ?, payment_method = ?, midtrans_transaction_id = ?,
         paid_at = CASE WHEN ? = 'paid' AND paid_at IS NULL THEN ? ELSE paid_at END,
         raw_notification = ?, signature_verified = 1, updated_at = ?
     WHERE order_id = ? AND status <> 'paid'`
  ).bind(
    nextStatus,
    paymentMethod,
    transactionId,
    nextStatus,
    now,
    JSON.stringify(body),
    now,
    payload.order_id,
  ).run()

  return { message: 'OK' }
})
