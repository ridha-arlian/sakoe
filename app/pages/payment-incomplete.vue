<script setup lang="ts">
  import { AlertTriangle, Clock, ExternalLink, HelpCircle, Loader2, XCircle } from "@lucide/vue";
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";
  import { Skeleton } from "@/components/ui/skeleton";
  import { MIN_AMOUNT } from "~~/shared/donation";
  import { loadLastOrderId, saveRedirectFlag } from "@/utils/draft";
  import { markReturnHandled } from "@/utils/payment-return";

  definePageMeta({ ssr: false });

  useSeoMeta({ title: "Payment Not Completed | Sakoe", robots: "noindex, nofollow" });

  const draft = useDonationForm();
  const orderId = loadLastOrderId();

  const pendingPaymentUrl = ref("");
  const statusLoading = ref(true);
  const txStatus = ref<TxStatus | null>(null);
  const amount = computed(() => draft.value?.amount ?? MIN_AMOUNT);
  const formattedAmount = computed(() => formatIDR(amount.value));
  const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.value?.email.trim() ?? ""));

  const statusView = computed(() => (txStatus.value ? STATUS_VIEW_CONFIG[txStatus.value] : null));

  const statusIcon = computed(() => {
    switch (txStatus.value) {
      case "pending":
        return Clock;
      case "cancelled":
      case "failed":
        return XCircle;
      case "expired":
        return AlertTriangle;
      default:
        return HelpCircle;
    }
  });

  const statusVariant = computed(() => {
    if (txStatus.value === "failed") {
      return "destructive" as const;
    }

    return txStatus.value === "pending" ? ("secondary" as const) : ("outline" as const);
  });

  const statusMessage = computed(() => {
    if (statusLoading.value) {
      return "Checking the latest payment status.";
    }

    switch (txStatus.value) {
      case "pending":
        return "Your donation is still waiting for payment.";
      case "cancelled":
      case "expired":
      case "failed":
        return "This payment is no longer active. Start a new one to continue.";
      case "refunded":
        return "This donation was refunded to the sender.";
      default:
        return "We could not confirm the payment status. Check it before paying again.";
    }
  });

  const { isRedirecting, errorMsg, startPayment } = useTakoPayment();

  async function handlePay() {
    if (!draft.value || !isEmailValid.value || isRedirecting.value) {
      return;
    }

    await startPayment({
      amount: draft.value.amount,
      donorName: draft.value.donorName,
      message: draft.value.message,
      isAnonymous: draft.value.isAnonymous,
      email: draft.value.email,
      paymentMethod: draft.value.paymentMethod,
    });
  }

  function continuePayment() {
    if (orderId) {
      saveRedirectFlag(orderId);
    }
  }

  onMounted(async () => {
    if (!draft.value || !orderId) {
      await navigateTo("/", { replace: true });
      return;
    }

    markReturnHandled();

    try {
      const status = await $fetch<DonationStatus>("/api/status", {
        query: { order_id: orderId, refresh: "1" },
      });

      txStatus.value = status?.transactionStatus ?? null;

      if (status?.transactionStatus === "paid") {
        await navigateTo("/status", { replace: true });
        return;
      }

      pendingPaymentUrl.value =
        status?.transactionStatus === "pending" && status.paymentUrl ? status.paymentUrl : "";
    } catch {
      // Keep the card up; the status page can refresh it later.
    } finally {
      statusLoading.value = false;
    }
  });
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-background px-4 py-10">
    <Card class="w-full max-w-md">
      <CardHeader class="gap-4">
        <div class="flex items-center justify-between gap-4">
          <Skeleton v-if="statusLoading" class="size-12 rounded-full" />
          <div
            v-else
            class="flex size-12 items-center justify-center rounded-full"
            :class="statusView?.iconClass ?? 'bg-muted text-muted-foreground'"
          >
            <component :is="statusIcon" class="size-6" />
          </div>

          <Skeleton v-if="statusLoading" class="h-5 w-32 rounded-full" />
          <Badge v-else-if="statusView" :variant="statusVariant">{{ statusView.title }}</Badge>
        </div>

        <div class="flex flex-col gap-2">
          <CardTitle class="text-xl">Payment not completed</CardTitle>
          <CardDescription>{{ statusMessage }}</CardDescription>
        </div>
      </CardHeader>

      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-col gap-1 rounded-xl bg-muted/50 px-4 py-4">
          <span class="text-sm text-muted-foreground">Donation amount</span>
          <span class="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {{ formattedAmount }}
          </span>
        </div>

        <Separator />

        <div class="flex flex-col gap-2" :aria-busy="statusLoading">
          <Skeleton v-if="statusLoading" class="h-10 w-full rounded-md" />

          <Button v-else-if="pendingPaymentUrl" as-child size="lg" class="w-full">
            <a :href="pendingPaymentUrl" @click="continuePayment">Continue payment</a>
          </Button>

          <Button
            v-else
            size="lg"
            class="w-full"
            :disabled="!isEmailValid || isRedirecting"
            @click="handlePay"
          >
            <Loader2 v-if="isRedirecting" data-icon="inline-start" class="animate-spin" />
            <ExternalLink v-else data-icon="inline-start" />
            {{ isRedirecting ? "Redirecting to Tako..." : "Start new payment" }}
          </Button>
        </div>

        <Alert v-if="errorMsg" variant="destructive">
          <AlertDescription>{{ errorMsg }}</AlertDescription>
        </Alert>

        <div class="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" as-child>
            <NuxtLink to="/">Change amount</NuxtLink>
          </Button>
          <Button variant="ghost" size="sm" as-child>
            <NuxtLink to="/status">View status</NuxtLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
