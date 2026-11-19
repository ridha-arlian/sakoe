<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Heart, ShieldCheck, Loader2 } from "@lucide/vue";
  import { DEFAULT_PAYMENT_METHOD, MAX_AMOUNT, MIN_AMOUNT } from "~~/shared/donation";
  import { loadDonationDraft, loadRecentOrderId } from "@/utils/draft";
  import { wasReturnHandled } from "@/utils/payment-return";
  import AmountInput from "./AmountInput.vue";
  import AmountPresets from "./AmountPresets.vue";
  import DonorInfoForm from "./DonorInfoForm.vue";

  const amount      = ref<number | undefined>(MIN_AMOUNT);
  const donorName   = ref("");
  const message     = ref("");
  const isAnonymous = ref(false);
  const isLoading   = ref(false);

  const hasPendingPayment = ref(false);

  onMounted(async () => {
    const draft = loadDonationDraft();
    if (draft) {
      amount.value = draft.amount;
      donorName.value = draft.donorName;
      message.value = draft.message;
      isAnonymous.value = draft.isAnonymous;
    }

    const orderId = loadRecentOrderId();
    if (!orderId || wasReturnHandled(orderId)) {
      return;
    }

    try {
      const status = await $fetch<DonationStatus>("/api/status", {
        query: { order_id: orderId },
      });
      hasPendingPayment.value = status?.transactionStatus === "pending";
    } catch {
      // A stale or unpaid order should never block the donation form.
    }
  });

  const isAmountValid = computed(
    () => amount.value !== undefined && amount.value >= MIN_AMOUNT && amount.value <= MAX_AMOUNT,
  );

  async function handleDonate() {
    if (!isAmountValid.value || isLoading.value) return;

    isLoading.value = true;

    const form = useDonationForm();
    const previous = loadDonationDraft();
    form.value = {
      amount: amount.value!,
      donorName: donorName.value,
      message: message.value,
      isAnonymous: isAnonymous.value,
      email: previous?.email ?? "",
      paymentMethod: previous?.paymentMethod ?? DEFAULT_PAYMENT_METHOD,
    };
    saveDonationDraft(form.value);

    await navigateTo("/checkout");
  }
</script>

<template>
  <Card class="mt-6 w-full max-w-sm gap-4 py-5">
    <CardHeader class="px-5 text-left">
      <CardTitle class="text-base">
        Buy me something?
      </CardTitle>
    </CardHeader>

    <CardContent class="px-5 flex flex-col gap-4">
      <AmountPresets v-model="amount" />
      <AmountInput v-model="amount" />

      <DonorInfoForm
        v-model:donor-name="donorName"
        v-model:message="message"
        v-model:is-anonymous="isAnonymous"
      />
    </CardContent>

    <CardFooter class="px-5 flex-col gap-2.5">
      <Button
        :disabled="!isAmountValid || isLoading"
        class="w-full"
        @click="handleDonate"
      >
        <Loader2 v-if="isLoading" data-icon="inline-start" class="animate-spin" />
        <Heart v-else data-icon="inline-start" />
        {{ isLoading ? "Redirecting..." : "Donate now" }}
      </Button>

      <p class="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
        <ShieldCheck class="w-3.5 h-3.5" />
        Secure payment via Tako
      </p>

      <Button v-if="hasPendingPayment" variant="ghost" size="sm" as-child class="w-full">
        <NuxtLink to="/status">Resume your last payment</NuxtLink>
      </Button>
    </CardFooter>
  </Card>
</template>
