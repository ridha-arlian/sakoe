export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const orderId = body.orderId as string;

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: "orderId wajib diisi." });
  }

  const config = useRuntimeConfig();
  const isProduction = config.midtransIsProduction === "true";
  const baseUrl = isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";

  const authHeader = `Basic ${Buffer.from(`${config.midtransServerKey}:`).toString("base64")}`;

  const donation = await prisma.donation.findUnique({
    where: { orderId },
  });

  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: "Transaksi tidak ditemukan." });
  }

  if (donation.status === "paid") {
    throw createError({ statusCode: 400, statusMessage: "Transaksi yang sudah dibayar tidak dapat dibatalkan." });
  }

  try {
    await $fetch<{ order_id: string; transaction_status: string }>(
      `${baseUrl}/v2/${orderId}/cancel`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: authHeader,
        },
      }
    );
  } catch (err: any) {
    console.warn(`Midtrans cancel skipped/failed for ${orderId}:`, err?.data?.status_message || err?.message);
  }

  const updatedDonation = await prisma.donation.update({
    where: { orderId },
    data: {
      status: "cancelled",
    },
  });

  return { 
    orderId: updatedDonation.orderId, 
    status: updatedDonation.status 
  };
});