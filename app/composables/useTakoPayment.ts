import type { TakoPaymentMethod } from '~~/shared/donation'
import { loadLastOrderId, saveLastOrderId, saveRedirectFlag } from '@/utils/draft'
import { clearReturnHandled } from '@/utils/payment-return'

export interface TakoDonationPayload {
  amount: number
  donorName: string
  message: string
  isAnonymous: boolean
  email: string
  paymentMethod: TakoPaymentMethod
  previousOrderId?: string
}

interface CreateGiftResponse {
  orderId: string
  giftId: string
  paymentUrl: string
}

const REDIRECT_TIMEOUT_MS = 15_000

export function useTakoPayment() {
  const isRedirecting = ref(false)
  const errorMsg = ref('')

  /**
   * Restored from bfcache after leaving for Tako: the component never remounts,
   * so the redirect state would stay stuck forever. Send the user to the return
   * page, which owns the resume/retry UI.
   */
  async function handlePageShow() {
    if (!isRedirecting.value) {
      return
    }

    isRedirecting.value = false
    await navigateTo('/payment-incomplete', { replace: true })
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

    try {
      const previousOrderId = payload.previousOrderId ?? loadLastOrderId()

      const result = await $fetch<CreateGiftResponse>('/api/donation', {
        method: 'POST',
        body: {
          ...payload,
          ...(previousOrderId ? { previousOrderId } : {}),
        },
      })

      if (!result?.paymentUrl) {
        errorMsg.value = 'Tako did not return a payment link. Please try again.'
        isRedirecting.value = false
        return
      }

      saveLastOrderId(result.orderId)
      saveRedirectFlag(result.orderId)
      clearReturnHandled()
      window.location.assign(result.paymentUrl)

      // Safety net for browsers that keep the page alive when navigation fails.
      window.setTimeout(() => {
        isRedirecting.value = false
      }, REDIRECT_TIMEOUT_MS)
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
