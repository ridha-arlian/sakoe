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

  try {
    const result = await $fetch<{ order_id: string; transaction_status: string }>(
      `${baseUrl}/v2/${orderId}/cancel`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: authHeader,
        },
      }
    );

    return { orderId: result.order_id, status: result.transaction_status };
  } catch (err: any) {
    return { orderId, status: "cancel_failed" };
  }
});