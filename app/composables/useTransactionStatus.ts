const POLL_DELAYS = [4000, 6000, 9000, 13500, 20000, 30000];
const MAX_POLL_ATTEMPTS = 12;

export function useTransactionStatus(orderId: Ref<string>) {
  const isLoading = ref(true);
  const errorMsg = ref("");
  const data = ref<DonationStatus | null>(null);

  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let pollAttempts = 0;
  let active = false;

  function stopPolling() {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  function schedulePoll() {
    stopPolling();

    if (!active || pollAttempts >= MAX_POLL_ATTEMPTS) {
      return;
    }

    const delay = POLL_DELAYS[Math.min(pollAttempts, POLL_DELAYS.length - 1)];

    pollTimer = setTimeout(async () => {
      pollAttempts++;
      await fetchStatus(true);
    }, delay);
  }

  async function fetchStatus(isPoll = false) {
    const currentOrderId = orderId.value;

    if (!currentOrderId) {
      errorMsg.value = "Order ID not found.";
      isLoading.value = false;
      stopPolling();
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
        schedulePoll();
      } else {
        stopPolling();
      }
    } catch (err) {
      const error = err as { data?: { statusMessage?: string }; message?: string };
      console.error("Error fetching status:", err);
      errorMsg.value = error?.data?.statusMessage || error?.message || "Failed to fetch transaction status.";
      stopPolling();
    } finally {
      if (!isPoll) isLoading.value = false;
    }
  }

  onMounted(() => {
    active = true;

    if (!orderId.value) {
      errorMsg.value = "Order ID not found.";
      isLoading.value = false;
      return;
    }

    fetchStatus();
  });

  watch(orderId, (newId) => {
    if (!active) return;

    stopPolling();
    pollAttempts = 0;

    if (!newId) {
      errorMsg.value = "Order ID not found.";
      isLoading.value = false;
      return;
    }

    fetchStatus();
  });

  onUnmounted(() => {
    active = false;
    stopPolling();
  });

  return { isLoading, errorMsg, data, fetchStatus };
}
