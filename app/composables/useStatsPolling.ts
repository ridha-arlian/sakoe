interface StatsResponse {
  totalCollected: number;
  totalSupporters: number;
}

export function useStatsPolling(intervalMs = 20000) {
  const { data, refresh } = useFetch<StatsResponse>("/api/stats");

  let interval: ReturnType<typeof setInterval> | null = null;

  function handleVisibility() {
    if (document.visibilityState === "visible") refresh();
  }

  onMounted(() => {
    interval = setInterval(() => refresh(), intervalMs);
    document.addEventListener("visibilitychange", handleVisibility);
  });

  onUnmounted(() => {
    if (interval) clearInterval(interval);
    document.removeEventListener("visibilitychange", handleVisibility);
  });

  return { data, refresh };
}