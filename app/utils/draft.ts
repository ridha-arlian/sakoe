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

export function clearDonationDraft(): void {
  if (!import.meta.client) {
    return
  }

  sessionStorage.removeItem(DONATION_DRAFT_KEY)
}

export function saveLastOrderId(orderId: string): void {
  if (!import.meta.client) {
    return
  }

  localStorage.setItem(LAST_ORDER_KEY, orderId)
}

export function loadLastOrderId(): string {
  if (!import.meta.client) {
    return ''
  }

  return localStorage.getItem(LAST_ORDER_KEY) ?? ''
}
