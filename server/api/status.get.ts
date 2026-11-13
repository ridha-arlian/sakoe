interface DonationRow {
  order_id: string
  amount: number
  status: string
  payment_method: string | null
  paid_at: number | null
  created_at: number
}

export default defineEventHandler(async (event) => {
  const orderId = getQuery(event).order_id as string

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: "order_id is required." })
  }

  const db = useDB(event)
  const donation = await db.prepare(
    `SELECT order_id, amount, status, payment_method, paid_at, created_at
     FROM donations
     WHERE order_id = ?`
  ).bind(orderId).first<DonationRow>()

  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: "Transaction not found." })
  }

  let status = donation.status
  let paymentMethod = donation.payment_method
  let paidAt = donation.paid_at

  if (status === "pending") {
    const config = useRuntimeConfig(event)
    const isProduction = config.midtransIsProduction === "true"
    const baseUrl = isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com"
    const authHeader = `Basic ${Buffer.from(`${config.midtransServerKey}:`).toString("base64")}`

    try {
      const result = await $fetch<{
        transaction_status: string
        payment_type: string
        fraud_status?: string
      }>(`${baseUrl}/v2/${orderId}/status`, {
        method: "GET",
        headers: { Accept: "application/json", Authorization: authHeader },
      })

      let newStatus = status
      if (result.transaction_status === "capture" || result.transaction_status === "settlement") {
        newStatus = result.fraud_status === "accept" || !result.fraud_status ? "paid" : "failed"
      } else if (result.transaction_status === "expire") {
        newStatus = "expired"
      } else if (result.transaction_status === "cancel" || result.transaction_status === "deny") {
        newStatus = "cancelled"
      }

      if (newStatus !== status) {
        const now = Date.now()
        const nextPaidAt = newStatus === "paid" ? now : null

        await db.prepare(
          `UPDATE donations
           SET status = ?, payment_method = ?, paid_at = ?, updated_at = ?
           WHERE order_id = ?`
        ).bind(newStatus, result.payment_type, nextPaidAt, now, orderId).run()

        status = newStatus
        paymentMethod = result.payment_type
        paidAt = nextPaidAt
      }
    } catch {
      // Midtrans status check is best-effort; keep the stored status on failure.
    }
  }

  return {
    orderId: donation.order_id,
    transactionStatus: status,
    paymentType: paymentMethod,
    amount: donation.amount,
    transactionTime: new Date(paidAt ?? donation.created_at).toISOString(),
  }
})
