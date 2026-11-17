import crypto from 'node:crypto'

interface TakoRequestError {
  statusCode?: number
  status?: number
  data?: {
    error?: { message?: string }
  }
  message?: string
}

function takoErrorMessage(error: TakoRequestError): { statusCode: number; statusMessage: string } {
  const status = error.statusCode ?? error.status

  switch (status) {
    case 400:
      return { statusCode: 400, statusMessage: 'Tako rejected the payment details.' }
    case 401:
      return { statusCode: 502, statusMessage: 'Tako rejected the API key.' }
    case 403:
      return { statusCode: 403, statusMessage: 'Tako did not allow this gift to the creator.' }
    case 404:
      return { statusCode: 404, statusMessage: 'The creator account was not found on Tako.' }
    case 429:
      return { statusCode: 429, statusMessage: 'Too many payment attempts. Try again shortly.' }
    default:
      return { statusCode: 502, statusMessage: 'Failed to create the payment.' }
  }
}

/**
 * Log the failing layer without leaking the API key: only the status code and
 * the upstream message are safe to write to the Worker log.
 */
function logTakoFailure(scope: string, error: unknown): void {
  const failure = error as TakoRequestError
  console.error(
    `[donation] ${scope} failed. status=${failure?.statusCode ?? failure?.status ?? 'unknown'} message=${failure?.message ?? 'unknown'}`,
  )
}

export default defineEventHandler(async (event) => {
  await assertWithinRateLimit(event)

  const parsed = parseDonationInput(await readBody(event))

  if (!parsed.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid donation input',
      data: parsed.errors,
    })
  }

  const donation = parsed.value
  const config = useRuntimeConfig(event)
  const db = useDB(event)

  if (!config.takoApiKey || !config.takoUsername) {
    console.error(
      `[donation] Tako is not configured. Missing: ${[
        !config.takoApiKey ? 'NUXT_TAKO_API_KEY' : null,
        !config.takoUsername ? 'NUXT_TAKO_USERNAME' : null,
      ]
        .filter(Boolean)
        .join(', ')}`,
    )

    throw createError({
      statusCode: 500,
      statusMessage: 'Tako is not configured.',
    })
  }

  const orderId = `sakoe-${crypto.randomBytes(6).toString('hex')}`
  const now = Date.now()

  await db.prepare(
    `INSERT INTO donations (id, order_id, amount, donor_name, is_anonymous, message, payment_method, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  ).bind(
    crypto.randomUUID(),
    orderId,
    donation.amount,
    donation.isAnonymous ? null : donation.donorName,
    donation.isAnonymous ? 1 : 0,
    donation.message,
    donation.paymentMethod,
    now,
    now,
  ).run()

  let result: Awaited<ReturnType<typeof createTakoGift>>

  try {
    result = await createTakoGift(
      {
        apiKey: config.takoApiKey,
        userAgent: config.takoUserAgent,
        username: config.takoUsername,
      },
      buildTakoGiftPayload(donation),
    )
  } catch (error) {
    logTakoFailure('Tako gift creation', error)

    await db.prepare(
      `UPDATE donations SET status = 'failed', updated_at = ? WHERE order_id = ?`
    ).bind(Date.now(), orderId).run()

    const mapped = takoErrorMessage(error as TakoRequestError)

    throw createError({
      statusCode: mapped.statusCode,
      statusMessage: mapped.statusMessage,
    })
  }

  try {
    await db.prepare(
      `UPDATE donations
       SET tako_gift_id = ?, tako_transaction_id = ?, tako_payment_url = ?, updated_at = ?
       WHERE order_id = ?`
    ).bind(result.giftId, result.transactionId, result.paymentUrl, Date.now(), orderId).run()
  } catch (error) {
    console.error('[donation] Failed to store the Tako gift reference.', error)

    await db.prepare(
      `UPDATE donations SET status = 'failed', updated_at = ? WHERE order_id = ?`
    ).bind(Date.now(), orderId).run()

    throw createError({
      statusCode: 500,
      statusMessage: 'The payment could not be prepared. Please try again.',
    })
  }

  return {
    orderId,
    giftId: result.giftId,
    paymentUrl: result.paymentUrl,
  }
})
