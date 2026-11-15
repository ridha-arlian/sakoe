interface StatsResponse {
  totalCollected: number;
  totalSupporters: number;
}

export function useStatsPolling(intervalMs = 20000) {
  const { data, pending, refresh } = useAsyncData(
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

  function handleVisibility() {
    if (document.visibilityState === "visible") refresh();
  }

  onMounted(() => {
    stopPolling();
    refresh();
    interval = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, intervalMs);

    document.addEventListener("visibilitychange", handleVisibility);
  });

  onUnmounted(() => {
    stopPolling();
    document.removeEventListener("visibilitychange", handleVisibility);
  });

  return { data, pending, refresh };
}
