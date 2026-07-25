import { ref, computed } from "vue";

export function useDonationAmount() {
  const amount = ref<number | undefined>(MIN_AMOUNT);

  const isAmountValid = computed(() => {
    return amount.value !== undefined && amount.value >= MIN_AMOUNT;
  });

  const formattedAmount = computed(() => {
    if (!amount.value) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount.value);
  });

  function setPreset(value: number) {
    amount.value = value;
  }

  function incrementAmount(step = 100) {
    amount.value = (amount.value || 0) + step;
  }

  function decrementAmount(step = 100) {
    const next = (amount.value || 0) - step;
    amount.value = next >= MIN_AMOUNT ? next : MIN_AMOUNT;
  }

  return {
    amount,
    isAmountValid,
    formattedAmount,
    setPreset,
    incrementAmount,
    decrementAmount,
  };
}