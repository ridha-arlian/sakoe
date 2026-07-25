export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const orderId = body.orderId as string;

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: "orderId is required." });
  }

  const config = useRuntimeConfig();
  const isProduction = config.midtransIsProduction === "true";
  const baseUrl = isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";

  const authHeader = `Basic ${Buffer.from(`${config.midtransServerKey}:`).toString("base64")}`;

  const donation = await prisma.donation.findUnique({
    where: { orderId },
  });

  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: "Transaction not found." });
  }

  if (donation.status === "paid") {
    throw createError({ statusCode: 400, statusMessage: "A paid transaction cannot be cancelled." });
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