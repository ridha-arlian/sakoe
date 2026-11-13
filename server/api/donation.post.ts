import crypto from "node:crypto";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  if (!body.amount || body.amount < 10000) {
    throw createError({ statusCode: 400, statusMessage: "Minimum amount is Rp 10,000" })
  }

  const db = useDB(event)
  const serverKey = config.midtransServerKey
  const isProduction = config.midtransIsProduction === "true"
  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions"
  const orderId = `sakoe-${crypto.randomBytes(6).toString("hex")}`
  const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`

  const payload = {
    transaction_details: { order_id: orderId, gross_amount: Number(body.amount) },
    credit_card: { secure: true },
    customer_details: { first_name: body.donorName || "Anonymous" },
    custom_field1: body.message || '',
  }

  try {
    const response = await $fetch<{ token: string; redirect_url: string }>(
      snapUrl,
      {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json", authorization: authHeader },
        body: payload,
      }
    )

    const now = Date.now()

    await db.prepare(
      `INSERT INTO donations (id, order_id, amount, donor_name, is_anonymous, message, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
    ).bind(
      crypto.randomUUID(),
      orderId,
      Number(body.amount),
      body.isAnonymous ? null : (body.donorName ?? null),
      body.isAnonymous ? 1 : 0,
      body.message || null,
      now,
      now,
    ).run()

    return { token: response.token, redirect_url: response.redirect_url, orderId }
  } catch (error) {
    const err = error as { statusCode?: number; data?: { error_messages?: string[] } }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.error_messages?.[0] || "Failed to process transaction",
    })
  }
})
