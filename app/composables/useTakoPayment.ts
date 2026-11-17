import type { TakoPaymentMethod } from '~~/shared/donation'
import { saveLastOrderId } from '@/utils/draft'

export interface TakoDonationPayload {
  amount: number
  donorName: string
  message: string
  isAnonymous: boolean
  email: string
  paymentMethod: TakoPaymentMethod
}

interface CreateGiftResponse {
  orderId: string
  giftId: string
  paymentUrl: string
}

export function useTakoPayment() {
  const isRedirecting = ref(false)
  const errorMsg = ref('')
  let handledReturn = false

  /**
   * Restored from bfcache after the user cancelled on Tako: the component never
   * remounts, so the redirect state would stay stuck forever. Reset it and send
   * the user to the status page instead of leaving a dead "Redirecting..." button.
   */
  function handlePageShow() {
    if (!isRedirecting.value) {
      return
    }

    isRedirecting.value = false

    // Only bounce once, so going back from /status to checkout still works.
    if (handledReturn) {
      return
    }

    handledReturn = true
    navigateTo('/status')
  }

  onMounted(() => {
    window.addEventListener('pageshow', handlePageShow)
  })

  onUnmounted(() => {
    window.removeEventListener('pageshow', handlePageShow)
  })

  async function startPayment(payload: TakoDonationPayload) {
    if (isRedirecting.value) {
      return
    }

    isRedirecting.value = true
    errorMsg.value = ''
    handledReturn = false

    try {
      const result = await $fetch<CreateGiftResponse>('/api/donation', {
        method: 'POST',
        body: payload,
      })

      if (!result?.paymentUrl) {
        errorMsg.value = 'Tako did not return a payment link. Please try again.'
        isRedirecting.value = false
        return
      }

      saveLastOrderId(result.orderId)
      window.location.assign(result.paymentUrl)
    } catch (err) {
      const error = err as { data?: { statusMessage?: string }; message?: string }
      errorMsg.value =
        error?.data?.statusMessage || error?.message || 'Failed to start the payment. Please try again.'
      isRedirecting.value = false
    }
  }

  return {
    isRedirecting,
    errorMsg,
    startPayment,
  }
}
