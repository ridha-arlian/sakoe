interface DonationFormState {
  amount: number;
  donorName: string;
  message: string;
  isAnonymous: boolean;
}

export function useDonationForm() {
  return useState<DonationFormState | null>("donation-form", () => null);
}