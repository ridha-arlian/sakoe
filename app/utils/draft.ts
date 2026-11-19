import {
  DEFAULT_PAYMENT_METHOD,
  isTakoPaymentMethod,
  MAX_AMOUNT,
  MAX_EMAIL_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  MIN_AMOUNT,
  type TakoPaymentMethod,
} from '~~/shared/donation'

export interface DonationFormState {
  amount: number
  donorName: string
  message: string
  isAnonymous: boolean
  email: string
  paymentMethod: TakoPaymentMethod
}

export const DONATION_DRAFT_KEY = 'sakoe-donation-draft'

export const LAST_ORDER_KEY = 'sakoe-last-order'

export const LAST_ORDER_AT_KEY = 'sakoe-last-order-at'

export const RECENT_ORDER_TTL_MS = 24 * 60 * 60 * 1000

export const REDIRECT_FLAG_KEY = 'sakoe-redirecting'

export const REDIRECT_FLAG_TTL_MS = 30 * 60 * 1000

export function serializeDraft(draft: DonationFormState | null): string | null {
  if (!draft) {
    return null
  }

  return JSON.stringify(draft)
}

export function parseDraft(raw: string | null): DonationFormState | null {
  if (!raw) {
    return null
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null
  }

  const {
    amount,
    donorName,
    message,
    isAnonymous,
    email = '',
    paymentMethod = DEFAULT_PAYMENT_METHOD,
  } = parsed as Record<string, unknown>

  if (
    typeof amount !== 'number' ||
    !Number.isInteger(amount) ||
    amount < MIN_AMOUNT ||
    amount > MAX_AMOUNT
  ) {
    return null
  }

  if (typeof donorName !== 'string' || donorName.length > MAX_NAME_LENGTH) {
    return null
  }

  if (typeof message !== 'string' || message.length > MAX_MESSAGE_LENGTH) {
    return null
  }

  if (typeof email !== 'string' || email.length > MAX_EMAIL_LENGTH) {
    return null
  }

  if (!isTakoPaymentMethod(paymentMethod)) {
    return null
  }

  if (typeof isAnonymous !== 'boolean') {
    return null
  }

  return { amount, donorName, message, isAnonymous, email, paymentMethod }
}

export function saveDonationDraft(draft: DonationFormState): void {
  if (!import.meta.client) {
    return
  }

  sessionStorage.setItem(DONATION_DRAFT_KEY, serializeDraft(draft) ?? '')
}

export function loadDonationDraft(): DonationFormState | null {
  if (!import.meta.client) {
    return null
  }

  return parseDraft(sessionStorage.getItem(DONATION_DRAFT_KEY))
}

export function saveLastOrderId(orderId: string, now = Date.now()): void {
  if (!import.meta.client) {
    return
  }

  localStorage.setItem(LAST_ORDER_KEY, orderId)
  localStorage.setItem(LAST_ORDER_AT_KEY, String(now))
}

export function loadLastOrderId(): string {
  if (!import.meta.client) {
    return ''
  }

  return localStorage.getItem(LAST_ORDER_KEY) ?? ''
}

export function isRecentOrder(savedAt: number, maxAgeMs = RECENT_ORDER_TTL_MS, now = Date.now()): boolean {
  if (!Number.isFinite(savedAt) || savedAt <= 0) {
    return false
  }

  return now - savedAt <= maxAgeMs
}

/**
 * Last order id, but only when it is recent enough to still be payable. Keeps
 * the landing page from asking Tako about stale orders on every visit.
 */
export function loadRecentOrderId(maxAgeMs = RECENT_ORDER_TTL_MS): string {
  if (!import.meta.client) {
    return ''
  }

  const orderId = localStorage.getItem(LAST_ORDER_KEY) ?? ''
  const savedAt = Number(localStorage.getItem(LAST_ORDER_AT_KEY))

  return orderId && isRecentOrder(savedAt, maxAgeMs) ? orderId : ''
}

export interface RedirectFlag {
  orderId: string
  at: number
}

export function parseRedirectFlag(raw: string | null): RedirectFlag | null {
  if (!raw) {
    return null
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null
  }

  const { orderId, at } = parsed as Record<string, unknown>

  if (typeof orderId !== 'string' || orderId.length === 0) {
    return null
  }

  if (typeof at !== 'number' || !Number.isFinite(at)) {
    return null
  }

  return { orderId, at }
}

/**
 * Marks that the browser is about to leave for Tako, so the checkout can tell
 * a plain revisit apart from a return after an unfinished payment.
 */
export function saveRedirectFlag(orderId: string, now = Date.now()): void {
  if (!import.meta.client) {
    return
  }

  sessionStorage.setItem(REDIRECT_FLAG_KEY, JSON.stringify({ orderId, at: now }))
}

/**
 * Reads and clears the flag. Returns true only for a fresh flag that belongs to
 * the order we are looking at.
 */
export function consumeRedirectFlag(
  expectedOrderId?: string,
  maxAgeMs = REDIRECT_FLAG_TTL_MS,
  now = Date.now(),
): boolean {
  if (!import.meta.client) {
    return false
  }

  const flag = parseRedirectFlag(sessionStorage.getItem(REDIRECT_FLAG_KEY))

  sessionStorage.removeItem(REDIRECT_FLAG_KEY)

  if (!flag || !isRecentOrder(flag.at, maxAgeMs, now)) {
    return false
  }

  return expectedOrderId === undefined || flag.orderId === expectedOrderId
}

export function clearRedirectFlag(): void {
  if (!import.meta.client) {
    return
  }

  sessionStorage.removeItem(REDIRECT_FLAG_KEY)
}
