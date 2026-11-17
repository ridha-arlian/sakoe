interface DonationRow {
  order_id: string
  amount: number
  status: string
  payment_method: string | null
  paid_at: number | null
  created_at: number
  tako_gift_id: string | null
  tako_payment_url: string | null
}

export default defineEventHandler(async (event) => {
  const orderId = getQuery(event).order_id as string

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: "order_id is required." })
  }

  const db = useDB(event)
  const donation = await db.prepare(
    `SELECT order_id, amount, status, payment_method, paid_at, created_at, tako_gift_id, tako_payment_url
     FROM donations
     WHERE order_id = ?`
  ).bind(orderId).first<DonationRow>()

  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: "Transaction not found." })
  }

  let status = donation.status
  const paymentMethod = donation.payment_method
  let paidAt = donation.paid_at

  if (status === "pending" && donation.tako_gift_id) {
    const config = useRuntimeConfig(event)

    if (config.takoApiKey) {
      try {
        const gift = await getTakoGift(
          {
            apiKey: config.takoApiKey,
            userAgent: config.takoUserAgent,
          },
          donation.tako_gift_id,
        )

        const nextStatus = mapTakoStatus(gift.status)

        if (nextStatus && nextStatus !== status) {
          const now = Date.now()
          const nextPaidAt = nextStatus === "paid" ? now : paidAt

          await db.prepare(
            `UPDATE donations
             SET status = ?, paid_at = ?, updated_at = ?
             WHERE order_id = ?`
          ).bind(nextStatus, nextPaidAt, now, orderId).run()

          status = nextStatus
          paidAt = nextPaidAt
        }
      } catch {
        // Tako status check is best-effort; keep the stored status on failure.
      }
    }
  }

  return {
    orderId: donation.order_id,
    transactionStatus: status,
    paymentType: paymentMethod,
    amount: donation.amount,
    transactionTime: new Date(paidAt ?? donation.created_at).toISOString(),
    paymentUrl: status === "pending" ? donation.tako_payment_url : null,
  }
})
