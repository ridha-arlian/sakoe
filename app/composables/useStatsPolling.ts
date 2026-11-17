interface StatsResponse {
  totalCollected: number;
  totalSupporters: number;
}

export function useStatsPolling(intervalMs = 20000) {
  const { data, refresh } = useAsyncData(
    "stats",
    () => $fetch<StatsResponse>("/api/stats"),
    {
      default: () => null as StatsResponse | null,
    },
  );

  let interval: ReturnType<typeof setInterval> | null = null;

  function stopPolling() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  function startPolling() {
    stopPolling();
    interval = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, intervalMs);
  }

  function handleVisibility() {
    if (document.visibilityState === "visible") {
      refresh();
      startPolling();
      return;
    }

    stopPolling();
  }

  onMounted(() => {
    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);
  });

  onUnmounted(() => {
    stopPolling();
    document.removeEventListener("visibilitychange", handleVisibility);
  });

  return { data, refresh };
}
