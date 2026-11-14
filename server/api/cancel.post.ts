export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const orderId = body.orderId as string;
  const cancelToken = body.cancelToken as string | undefined;

  const config = useRuntimeConfig(event);

  if (!orderId || !cancelToken) {
    throw createError({ statusCode: 400, statusMessage: "orderId and cancelToken are required." });
  }

  if (!verifyCancelToken(orderId, cancelToken, config.midtransServerKey)) {
    throw createError({ statusCode: 403, statusMessage: "Invalid cancel token." });
  }

  const isProduction = config.midtransIsProduction === "true";
  const baseUrl = isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";

  const authHeader = `Basic ${Buffer.from(`${config.midtransServerKey}:`).toString("base64")}`;

  const db = useDB(event);
  const donation = await db.prepare(
    `SELECT status FROM donations WHERE order_id = ?`
  ).bind(orderId).first<{ status: string }>();

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
  } catch (error) {
    const err = error as { data?: { status_message?: string }; message?: string };
    console.warn(`Midtrans cancel skipped/failed for ${orderId}:`, err?.data?.status_message || err?.message);
  }

  await db.prepare(
    `UPDATE donations SET status = 'cancelled', updated_at = ? WHERE order_id = ?`
  ).bind(Date.now(), orderId).run();

  return { 
    orderId, 
    status: "cancelled" 
  };
});
