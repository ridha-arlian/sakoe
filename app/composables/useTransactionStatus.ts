import { toast } from 'vue-sonner'

const POLL_DELAYS = [4000, 6000, 9000, 13500, 20000, 30000]
const MAX_POLL_ATTEMPTS = 12

export function useTransactionStatus(orderId: Ref<string>) {
  const isLoading = ref(true)
  const isRefreshing = ref(false)
  const errorMsg = ref('')
  const data = ref<DonationStatus | null>(null)

  let pollTimer: ReturnType<typeof setTimeout> | null = null
  let pollAttempts = 0
  let active = false

  function stopPolling() {
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  function schedulePoll() {
    stopPolling()

    if (!active || pollAttempts >= MAX_POLL_ATTEMPTS) {
      return
    }

    const delay = POLL_DELAYS[Math.min(pollAttempts, POLL_DELAYS.length - 1)]

    pollTimer = setTimeout(async () => {
      pollAttempts++
      await fetchStatus(true)
    }, delay)
  }

  async function fetchStatus(isPoll = false, force = false) {
    const currentOrderId = orderId.value

    if (!currentOrderId) {
      errorMsg.value = 'Order ID not found.'
      isLoading.value = false
      stopPolling()
      return
    }

    if (!isPoll) {
      pollAttempts = 0
      errorMsg.value = ''

      if (data.value) {
        isRefreshing.value = true
      } else {
        isLoading.value = true
      }
    }

    try {
      const result = await $fetch<DonationStatus>('/api/status', {
        query: force
          ? { order_id: currentOrderId, refresh: '1' }
          : { order_id: currentOrderId },
      })

      if (currentOrderId !== orderId.value) {
        return
      }

      data.value = result
      errorMsg.value = ''

      if (result?.transactionStatus === 'pending') {
        schedulePoll()
      } else {
        stopPolling()
      }
    } catch (err) {
      if (currentOrderId !== orderId.value) {
        return
      }

      const error = err as { data?: { statusMessage?: string }; message?: string }
      const message =
        error?.data?.statusMessage || error?.message || 'Failed to fetch transaction status.'

      stopPolling()

      if (data.value) {
        toast.error(message)
        return
      }

      console.error('Error fetching status:', err)
      errorMsg.value = message
    } finally {
      if (currentOrderId === orderId.value) {
        isLoading.value = false
        isRefreshing.value = false
      }
    }
  }

  function handleVisibility() {
    if (document.visibilityState === 'hidden') {
      stopPolling()
      return
    }

    if (active && data.value?.transactionStatus === 'pending') {
      fetchStatus(true)
    }
  }

  onMounted(() => {
    active = true

    if (!orderId.value) {
      errorMsg.value = 'Order ID not found.'
      isLoading.value = false
      return
    }

    document.addEventListener('visibilitychange', handleVisibility)
    fetchStatus()
  })

  watch(orderId, (newId) => {
    if (!active) return

    stopPolling()
    pollAttempts = 0
    data.value = null
    errorMsg.value = ''
    isRefreshing.value = false

    if (!newId) {
      errorMsg.value = 'Order ID not found.'
      isLoading.value = false
      return
    }

    fetchStatus()
  })

  onUnmounted(() => {
    active = false
    stopPolling()
    document.removeEventListener('visibilitychange', handleVisibility)
  })

  return { isLoading, isRefreshing, errorMsg, data, fetchStatus }
}
