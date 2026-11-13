import crypto from "node:crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig(event)

  const { order_id, status_code, gross_amount, signature_key, transaction_status, transaction_id, payment_type, fraud_status } = body

  const expectedSignature = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${config.midtransServerKey}`)
    .digest("hex")

  if (signature_key !== expectedSignature) {
    throw createError({ statusCode: 403, statusMessage: "Invalid signature" })
  }

  let status: "pending" | "paid" | "expired" | "failed" | "cancelled" = "pending"

  if (transaction_status === "capture" || transaction_status === "settlement") {
    status = fraud_status === "accept" || !fraud_status ? "paid" : "failed"
  } else if (transaction_status === "expire") {
    status = "expired"
  } else if (transaction_status === "cancel" || transaction_status === "deny") {
    status = "cancelled"
  }

  const now = Date.now()
  const db = useDB(event)

  const result = await db.prepare(
    `UPDATE donations
     SET status = ?, payment_method = ?, midtrans_transaction_id = ?, paid_at = ?,
         raw_notification = ?, signature_verified = 1, updated_at = ?
     WHERE order_id = ?`
  ).bind(
    status,
    payment_type,
    transaction_id,
    status === "paid" ? now : null,
    JSON.stringify(body),
    now,
    order_id,
  ).run()

  if (result.meta.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: "Order ID not found" })
  }

  return { message: "OK" }
})
