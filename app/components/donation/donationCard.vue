<script setup lang="ts">
  import { ref, computed } from "vue";
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Alert } from "@/components/ui/alert";
  import { Heart, ShieldCheck, Loader2 } from "@lucide/vue";
  import { MIN_AMOUNT } from "~~/shared/donation";
  import AmountInput from "./AmountInput.vue";
  import AmountPresets from "./AmountPresets.vue";
  import DonorInfoForm from "./DonorInfoForm.vue";

  const amount      = ref<number | undefined>(MIN_AMOUNT);
  const donorName   = ref("");
  const message     = ref("");
  const isAnonymous = ref(false);
  const isLoading   = ref(false);
  const errorMsg    = ref("");

  const isAmountValid = computed(() => amount.value !== undefined && amount.value >= MIN_AMOUNT);

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
        v-model:donorName="donorName"
        v-model:message="message"
        v-model:isAnonymous="isAnonymous"
      />
    </CardContent>

    <CardFooter class="px-5 flex-col gap-2.5">
      <Alert v-if="errorMsg" variant="destructive" class="text-xs">
        {{ errorMsg }}
      </Alert>

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
        Secure &amp; encrypted transaction via Midtrans
      </p>
    </CardFooter>
  </Card>
</template>
