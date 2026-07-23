export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body.amount || body.amount < 10000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nominal minimal Rp 10.000',
    })
  }

  const serverKey = config.midtransServerSandbox

  if (!serverKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Key Midtrans belum diisi di .env (MIDTRANS_SERVER_KEY_SANDBOX)',
    })
  }

  const orderId = `DONATE-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`

  const url = 'https://app.sandbox.midtrans.com/snap/v1/transactions'

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Number(body.amount),
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: body.donorName || 'Anonim',
    },
    custom_field1: body.message || '',
  }

  try {
    const response = await $fetch<{ token: string; redirect_url: string }>(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: authHeader,
      },
      body: payload,
    })

    return {
      token: response.token,
      redirect_url: response.redirect_url,
    }
  } catch (error: any) {
    console.error('Midtrans Error:', error.data || error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.error_messages?.[0] || 'Gagal memproses transaksi',
    })
  }
})