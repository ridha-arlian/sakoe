import type { DonationFormState } from '@/utils/draft'
import { loadDonationDraft } from '@/utils/draft'

export function useDonationForm() {
  const state = useState<DonationFormState | null>('donation-form', () => null)

  if (import.meta.client && !state.value) {
    state.value = loadDonationDraft()
  }

  return state
}
