import { consumeRedirectFlag, loadLastOrderId } from '@/utils/draft'

const RETURN_SEEN_KEY = 'sakoe-return-seen'

/**
 * True when the browser came back from Tako after leaving the checkout. The
 * redirect flag covers the normal path, while the referrer covers a full reload
 * where the flag was already consumed. The seen marker keeps a stale referrer
 * from bouncing every later checkout visit.
 */
export function shouldShowReturnPage(): boolean {
  if (!import.meta.client) {
    return false
  }

  const orderId = loadLastOrderId()

  if (!orderId) {
    return false
  }

  if (consumeRedirectFlag(orderId)) {
    return true
  }

  if (!document.referrer.includes('tako.id')) {
    return false
  }

  return sessionStorage.getItem(RETURN_SEEN_KEY) !== orderId
}

export function markReturnHandled(orderId = loadLastOrderId()): void {
  if (!import.meta.client || !orderId) {
    return
  }

  sessionStorage.setItem(RETURN_SEEN_KEY, orderId)
}

export function clearReturnHandled(): void {
  if (!import.meta.client) {
    return
  }

  sessionStorage.removeItem(RETURN_SEEN_KEY)
}

export function wasReturnHandled(orderId = loadLastOrderId()): boolean {
  if (!import.meta.client || !orderId) {
    return false
  }

  return sessionStorage.getItem(RETURN_SEEN_KEY) === orderId
}
