export default defineEventHandler(async (event) => {
  const orderId = getQuery(event).order_id as string;

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: "order_id wajib diisi." });
  }

  const config = useRuntimeConfig();

  const isProduction = config.midtransIsProduction === "true";
  const baseUrl = isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";

  const authHeader = `Basic ${Buffer.from(`${config.midtransServerKey}:`).toString("base64")}`;

  try {
    const result = await $fetch<{
      order_id: string;
      transaction_status: string;
      payment_type: string;
      gross_amount: string;
      transaction_time: string;
      status_code: string;
    }>(`${baseUrl}/v2/${orderId}/status`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
    });

    return {
      orderId: result.order_id,
      transactionStatus: result.transaction_status,
      paymentType: result.payment_type,
      amount: Number(result.gross_amount),
      transactionTime: result.transaction_time,
    };
  } catch (err: any) {
    throw createError({
      statusCode: 404,
      statusMessage: "Transaksi tidak ditemukan.",
    });
  }
});