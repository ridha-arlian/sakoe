import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body.amount || body.amount < 10000) {
    throw createError({ statusCode: 400, statusMessage: 'Nominal minimal Rp 10.000' })
  }

  const serverKey = config.midtransServerKey
  const orderId = `sakoe-${crypto.randomBytes(6).toString('hex')}`
  const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`

  const payload = {
    transaction_details: { order_id: orderId, gross_amount: Number(body.amount) },
    credit_card: { secure: true },
    customer_details: { first_name: body.donorName || 'Anonim' },
    custom_field1: body.message || '',
  }

  try {
    const response = await $fetch<{ token: string; redirect_url: string }>(
      'https://app.sandbox.midtrans.com/snap/v1/transactions',
      {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json', authorization: authHeader },
        body: payload,
      }
    )

    await prisma.donation.create({
      data: {
        orderId,
        amount: BigInt(body.amount),
        donorName: body.isAnonymous ? null : body.donorName,
        isAnonymous: body.isAnonymous ?? false,
        message: body.message || null,
        status: 'pending',
      },
    })

    return { token: response.token, redirect_url: response.redirect_url, orderId }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.error_messages?.[0] || 'Gagal memproses transaksi',
    })
  }
})