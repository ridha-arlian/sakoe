import crypto from "node:crypto";

export default defineEventHandler(async (event) => {
  await assertWithinRateLimit(event)

  const parsed = parseDonationInput(await readBody(event))

  if (!parsed.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid donation input",
      data: parsed.errors,
    })
  }

  const donation = parsed.value
  const config = useRuntimeConfig(event)
  const db = useDB(event)
  const serverKey = config.midtransServerKey
  const isProduction = config.midtransIsProduction === "true"
  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions"
  const orderId = `sakoe-${crypto.randomBytes(6).toString("hex")}`
  const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`
  const now = Date.now()

  await db.prepare(
    `INSERT INTO donations (id, order_id, amount, donor_name, is_anonymous, message, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  ).bind(
    crypto.randomUUID(),
    orderId,
    donation.amount,
    donation.isAnonymous ? null : donation.donorName,
    donation.isAnonymous ? 1 : 0,
    donation.message,
    now,
    now,
  ).run()

  const payload = buildSnapPayload(donation, orderId)

  try {
    const response = await $fetch<{ token: string; redirect_url: string }>(snapUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: authHeader,
      },
      body: payload,
    })

    await db.prepare(
      `UPDATE donations SET snap_token = ?, snap_redirect_url = ?, updated_at = ? WHERE order_id = ?`
    ).bind(response.token, response.redirect_url, Date.now(), orderId).run()

    return {
      token: response.token,
      redirect_url: response.redirect_url,
      orderId,
      cancelToken: signCancelToken(orderId, serverKey),
    }
  } catch (error) {
    await db.prepare(
      `UPDATE donations SET status = 'failed', updated_at = ? WHERE order_id = ?`
    ).bind(Date.now(), orderId).run()

    const err = error as {
      statusCode?: number
      data?: { error_messages?: string[]; status_message?: string }
      message?: string
    }

    throw createError({
      statusCode: 502,
      statusMessage:
        err.data?.error_messages?.[0] ||
        err.data?.status_message ||
        "Failed to create the payment transaction",
    })
  }
})
