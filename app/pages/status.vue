<script setup lang="ts">
  import { Loader2 } from "@lucide/vue";

  const route = useRoute();

  const orderId = computed(() => (route.query.order_id as string) || "");

  const { isLoading, errorMsg, data, fetchStatus } = useTransactionStatus(orderId);

  const paymentTypeLabel = computed(() => {
    if (!data.value?.paymentType) return "-";
    return PAYMENT_TYPE_LABELS[data.value.paymentType] ?? data.value.paymentType;
  });

  const formattedAmount = computed(() => {
    if (!data.value?.amount) return "Rp 0";
    return formatIDR(data.value.amount);
  });

  const view = computed(() => {
    if (!data.value?.transactionStatus) return null;
    return STATUS_VIEW_CONFIG[data.value.transactionStatus] ?? null;
  });

  function copyOrderId() {
    if (data.value?.orderId) {
      navigator.clipboard.writeText(data.value.orderId);
    }
  }
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4 py-12">
    <div class="w-full max-w-md">
      <div class="rounded-2xl border border-border bg-card shadow-sm p-8 flex flex-col items-center text-center">

        <div v-if="isLoading" class="py-10 flex flex-col items-center gap-3">
          <Loader2 class="w-6 h-6 animate-spin text-primary" />
          <p class="font-inter text-sm text-muted-foreground">Checking transaction status...</p>
        </div>

        <div v-else-if="errorMsg" class="w-full flex flex-col items-center">
          <div class="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
          </div>
          <h1 class="text-xl font-semibold text-foreground">Something Went Wrong</h1>
          <p class="text-sm text-muted-foreground mt-1">{{ errorMsg }}</p>
          <NuxtLink to="/" class="w-full mt-6 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2.5 hover:bg-primary/90 transition-colors">
            Back to Home
          </NuxtLink>
        </div>

        <div v-else-if="data && view" class="w-full flex flex-col items-center">
          <div class="h-16 w-16 rounded-full flex items-center justify-center mb-4" :class="view.iconClass">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" :d="view.icon" />
            </svg>
          </div>

          <h1 class="font-inter text-xl font-semibold text-foreground">{{ view.title }}</h1>
          <p class="font-inter text-sm text-muted-foreground mt-1">{{ view.message }}</p>

          <div class="w-full mt-6 rounded-xl bg-muted/50 divide-y divide-border text-left">
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-muted-foreground">Amount</span>
              <span class="text-sm font-semibold text-primary">{{ formattedAmount }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-muted-foreground">Method</span>
              <span class="text-sm font-medium text-foreground">{{ paymentTypeLabel }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-muted-foreground">Order ID</span>
              <button class="text-sm font-mono text-foreground hover:text-primary transition-colors" @click="copyOrderId">
                {{ data.orderId }}
              </button>
            </div>
          </div>

          <button
            v-if="data.transactionStatus === 'pending'"
            class="w-full mt-6 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2.5 hover:bg-primary/90 transition-colors"
            @click="fetchStatus()"
          >
            {{ view.primaryLabel }}
          </button>
          <NuxtLink
            v-else
            :to="view.primaryTo"
            class="w-full mt-6 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2.5 hover:bg-primary/90 transition-colors"
          >
            {{ view.primaryLabel }}
          </NuxtLink>
        </div>

        <div v-else class="py-6">
          <p class="text-sm text-muted-foreground">Transaction data cannot be displayed.</p>
        </div>

      </div>
    </div>
  </div>
</template>