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

  async function startPayment(payload: TakoDonationPayload) {
    if (isRedirecting.value) {
      return
    }

    isRedirecting.value = true
    errorMsg.value = ''

    try {
      const result = await $fetch<CreateGiftResponse>('/api/donation', {
        method: 'POST',
        body: payload,
      })

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
