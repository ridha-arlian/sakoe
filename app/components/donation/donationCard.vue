<script setup lang="ts">
  import { ref } from "vue";
  import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import { Heart, ShieldCheck, Loader2 } from "@lucide/vue";
  import { useDonationAmount } from "@/composables/useDonationAmount";
  import AmountPresets from "@/components/donation/AmountPresets.vue";
  import AmountInput from "@/components/donation/AmountInput.vue";
  import DonorInfoForm from "@/components/donation/DonorInfoForm.vue";

  const { amount, isAmountValid, formattedAmount, incrementAmount, decrementAmount } = useDonationAmount();

  const donorName = ref("");
  const message = ref("");
  const isAnonymous = ref(false);
  const isLoading = ref(false);
  const errorMsg = ref("");

  async function handleDonate() {
    if (!isAmountValid.value || isLoading.value) return;

    isLoading.value = true;

    const form = useDonationForm();
    form.value = {
      amount: amount.value!,
      donorName: donorName.value,
      message: message.value,
      isAnonymous: isAnonymous.value,
    };

    await navigateTo("/checkout");
  }
</script>

<template>
  <Card class="mt-6 w-full max-w-sm bg-card border border-border rounded-xl p-5 text-left shadow-sm flex flex-col gap-4">
    <div>
      <h2 class="font-inter text-base font-semibold text-foreground">
        Buy me something?
      </h2>
    </div>

    <div class="flex flex-col gap-2.5">
      <AmountPresets v-model:amount="amount" />
      <AmountInput
        v-model:amount="amount"
        :is-amount-valid="isAmountValid"
        :formatted-amount="formattedAmount"
        @increment="incrementAmount"
        @decrement="decrementAmount"
      />
    </div>

    <DonorInfoForm
      v-model:donor-name="donorName"
      v-model:message="message"
      v-model:is-anonymous="isAnonymous"
    />

    <div class="flex flex-col gap-2.5 pt-1">
      <p v-if="errorMsg" class="font-inter text-center text-[12px] text-destructive">
        {{ errorMsg }}
      </p>

      <Button
        :disabled="!isAmountValid || isLoading"
        class="font-inter w-full h-10 text-sm font-medium gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleDonate"
      >
        <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
        <Heart v-else class="w-4 h-4" />
        {{ isLoading ? "Redirecting..." : "Donate now" }}
      </Button>

      <p class="font-inter text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
        <ShieldCheck class="w-3.5 h-3.5 text-muted-foreground" />
        Secure &amp; encrypted transaction via Midtrans
      </p>
    </div>
  </Card>
</template>