<script setup lang="ts">
  import { Loader2 } from "@lucide/vue";
  import { Button } from "@/components/ui/button";

  const form = useDonationForm();

  const amount = form.value?.amount ?? 0;
  const donorName = form.value?.donorName ?? "";
  const message = form.value?.message ?? "";
  const isAnonymous = form.value?.isAnonymous ?? false;

  const formattedAmount = computed(() => formatIDR(amount));

  const { isLoading, isEmbedRendering, isCancelling, errorMsg, handleCancelClick } = useSnapPayment({
    amount,
    donorName,
    message,
    isAnonymous,
  });
</script>

<template>
  <div class="min-h-screen flex flex-col items-center bg-background px-4 py-12">
    <div class="w-full max-w-md rounded-2xl border border-border bg-card shadow-sm p-5 text-center">
      <p class="font-inter text-sm text-muted-foreground">Completing payment</p>
      <p class="font-inter text-lg font-semibold text-foreground mt-0.5">{{ formattedAmount }}</p>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 class="w-6 h-6 animate-spin text-primary" />
      <p class="font-inter text-sm text-muted-foreground">Preparing payment...</p>
    </div>

    <p v-if="errorMsg" class="font-inter text-center text-sm text-destructive py-8">
      {{ errorMsg }}
    </p>

    <div v-if="!isLoading && !errorMsg" class="relative w-full max-w-md" style="min-height: 600px;">
      <div v-if="isEmbedRendering" class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm rounded-xl">
        <Loader2 class="w-6 h-6 animate-spin text-primary" />
        <p class="font-inter text-sm text-muted-foreground">Opening payment window...</p>
      </div>
      <div id="snap-container" class="snap-embed-container" />
    </div>

    <div class="w-full max-w-md rounded-2xl border border-border bg-card shadow-sm p-4 text-center">
      <!-- <Button as-child class="w-full" variant="outline" :disabled="isCancelling">
        <NuxtLink to="/" @click="handleCancelClick">
          <Loader2 v-if="isCancelling" class="w-4 h-4 animate-spin mr-2" />
          {{ isCancelling ? "Cancelling..." : "Cancel payment" }}
        </NuxtLink>
      </Button> -->
      <Button class="w-full" variant="outline"
        :disabled="isCancelling"
        @click="handleCancelClick"
      >
        <Loader2 v-if="isCancelling" class="w-4 h-4 animate-spin mr-2" />
        {{ isCancelling ? "Cancelling..." : "Cancel payment" }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
  .snap-embed-container {
    width: 100%;
    max-width: 28rem;
    margin: 1.5rem 0;
  }

  .snap-embed-container :deep(iframe) {
    width: 100% !important;
    min-height: 600px;
    border: none;
  }
</style>