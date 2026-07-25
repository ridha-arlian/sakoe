const POLL_INTERVAL = 5000;
const MAX_POLL_ATTEMPTS = 24;

export function useTransactionStatus(orderId: Ref<string>) {
  const isLoading = ref(true);
  const errorMsg = ref("");
  const data = ref<DonationStatus | null>(null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let pollAttempts = 0;

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(async () => {
      pollAttempts++;
      if (pollAttempts >= MAX_POLL_ATTEMPTS) {
        stopPolling();
        return;
      }
      await fetchStatus(true);
    }, POLL_INTERVAL);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  async function fetchStatus(isPoll = false) {
    const currentOrderId = orderId.value;

    if (!currentOrderId) {
      errorMsg.value = "Order ID not found.";
      isLoading.value = false;
      return;
    }

    if (!isPoll) isLoading.value = true;
    errorMsg.value = "";

    try {
      const result = await $fetch<DonationStatus>("/api/status", {
        query: { order_id: currentOrderId },
      });

      data.value = result;

      if (result?.transactionStatus === "pending") {
        if (!pollTimer) startPolling();
      } else {
        stopPolling();
      }
    } catch (err: any) {
      console.error("Error fetching status:", err);
      errorMsg.value = err?.data?.statusMessage || err?.message || "Failed to fetch transaction status.";
      stopPolling();
    } finally {
      if (!isPoll) isLoading.value = false;
    }
  }

  watch(
    orderId,
    (newId) => {
      if (newId) {
        fetchStatus();
      } else {
        errorMsg.value = "Order ID not found in URL.";
        isLoading.value = false;
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    stopPolling();
  });

  return { isLoading, errorMsg, data, fetchStatus };
}