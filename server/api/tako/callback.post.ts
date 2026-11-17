export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const rawBody = await readRawBody(event)

  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Empty callback body' })
  }

  let payload: TakoCallbackPayload

  try {
    payload = JSON.parse(rawBody) as TakoCallbackPayload
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON body' })
  }

  if (!config.takoCallbackSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Tako callback secret is not configured.' })
  }

  const signature = getHeader(event, 'x-tako-signature') ?? ''

  if (!verifyTakoSignature(payload, signature, config.takoCallbackSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  if (payload.event !== 'payment.success') {
    return { ok: true }
  }

  const giftId = payload.data?.relatedGiftId

  if (!giftId) {
    return { ok: true }
  }

  const db = useDB(event)
  const donation = await db.prepare(
    `SELECT amount, status FROM donations WHERE tako_gift_id = ?`
  ).bind(giftId).first<{ amount: number; status: string }>()

  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: 'Gift not found' })
  }

  if (Number(payload.data.amount) !== Number(donation.amount)) {
    throw createError({ statusCode: 400, statusMessage: 'Callback amount does not match the donation' })
  }

  if (donation.status === 'paid') {
    return { ok: true }
  }

  const now = Date.now()

  await db.prepare(
    `UPDATE donations
     SET status = 'paid', payment_method = ?, tako_transaction_id = ?,
         paid_at = COALESCE(paid_at, ?), raw_notification = ?, signature_verified = 1,
         updated_at = ?
     WHERE tako_gift_id = ? AND status <> 'paid'`
  ).bind(
    typeof payload.data.paymentMethod === 'string' ? payload.data.paymentMethod : null,
    typeof payload.data.id === 'string' ? payload.data.id : null,
    now,
    rawBody,
    now,
    giftId,
  ).run()

  return { ok: true }
})
