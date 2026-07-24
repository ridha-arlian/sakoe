import type { DonationStatus } from '../../generated/prisma/client'

export default defineEventHandler(async (event) => {
  const orderId = getQuery(event).order_id as string

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: "order_id wajib diisi." })
  }

  const donation = await prisma.donation.findUnique({ where: { orderId } })

  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: "Transaksi tidak ditemukan." })
  }

  let { status, paymentMethod, paidAt, amount } = donation

  if (status === 'pending') { 
    const config = useRuntimeConfig()
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

      let newStatus: DonationStatus = status
      if (result.transaction_status === 'capture' || result.transaction_status === 'settlement') {
        newStatus = result.fraud_status === 'accept' || !result.fraud_status ? 'paid' : 'failed'
      } else if (result.transaction_status === 'expire') {
        newStatus = 'expired'
      } else if (result.transaction_status === 'cancel' || result.transaction_status === 'deny') {
        newStatus = 'cancelled'
      }

      if (newStatus !== status) {
        const updated = await prisma.donation.update({
          where: { orderId },
          data: {
            status: newStatus,
            paymentMethod: result.payment_type,
            paidAt: newStatus === 'paid' ? new Date() : null,
          },
        })
        status = updated.status
        paymentMethod = updated.paymentMethod
        paidAt = updated.paidAt
      }
    } catch {
    }
  }

  return {
    orderId: donation.orderId,
    transactionStatus: status,
    paymentType: paymentMethod,
    amount: Number(amount),
    transactionTime: paidAt?.toISOString() ?? donation.createdAt.toISOString(),
  }
})