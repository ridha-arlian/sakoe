<script setup lang="ts">
  import { AlertTriangle, CheckCircle2, Clock, XCircle } from "@lucide/vue";
  import { toast } from "vue-sonner";
  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";
  import { Skeleton } from "@/components/ui/skeleton";

  const STATUS_ICONS = {
    paid: CheckCircle2,
    pending: Clock,
    failed: XCircle,
    expired: AlertTriangle,
    cancelled: XCircle,
  } satisfies Record<TxStatus, unknown>;

  const route = useRoute();

  useSeoMeta({ title: "Status | Sakoe", robots: "noindex, nofollow" });

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

  const statusIcon = computed(() => {
    if (!data.value?.transactionStatus) return null;
    return STATUS_ICONS[data.value.transactionStatus];
  });

  async function copyOrderId() {
    if (!data.value?.orderId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(data.value.orderId);
      toast.success("Order ID copied");
    } catch {
      toast.error("Could not copy");
    }
  }
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-background px-4 py-12">
    <Card class="w-full max-w-md">
      <CardContent class="flex flex-col items-center text-center">

        <div v-if="isLoading" class="w-full flex flex-col items-center">
          <Skeleton class="size-16 rounded-full" />
          <Skeleton class="h-6 w-48 mt-4" />
          <Skeleton class="h-4 w-64 mt-2" />

          <div class="w-full mt-6 rounded-xl bg-muted/50 px-4 py-3 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-4 w-24" />
            </div>
            <div class="flex items-center justify-between">
              <Skeleton class="h-4 w-16" />
              <Skeleton class="h-4 w-20" />
            </div>
            <div class="flex items-center justify-between">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-4 w-32" />
            </div>
          </div>
        </div>

        <div v-else-if="errorMsg" class="w-full flex flex-col items-center">
          <Alert variant="destructive" class="text-left">
            <AlertTriangle />
            <AlertTitle>Something Went Wrong</AlertTitle>
            <AlertDescription>{{ errorMsg }}</AlertDescription>
          </Alert>

          <Button as-child class="w-full mt-6">
            <NuxtLink to="/">Back to Home</NuxtLink>
          </Button>
        </div>

        <div v-else-if="data && view" class="w-full flex flex-col items-center">
          <div class="size-16 rounded-full flex items-center justify-center mb-4" :class="view.iconClass">
            <component :is="statusIcon" class="size-8" />
          </div>

          <h1 class="text-xl font-semibold text-foreground">{{ view.title }}</h1>
          <p class="text-sm text-muted-foreground mt-1">{{ view.message }}</p>

          <div class="w-full mt-6 rounded-xl bg-muted/50 px-4">
            <div class="flex items-center justify-between py-3">
              <span class="text-sm text-muted-foreground">Amount</span>
              <Badge variant="secondary">{{ formattedAmount }}</Badge>
            </div>
            <Separator />
            <div class="flex items-center justify-between py-3">
              <span class="text-sm text-muted-foreground">Method</span>
              <span class="text-sm font-medium text-foreground">{{ paymentTypeLabel }}</span>
            </div>
            <Separator />
            <div class="flex items-center justify-between py-3">
              <span class="text-sm text-muted-foreground">Order ID</span>
              <Button
                variant="link"
                class="h-auto p-0 font-mono text-sm"
                aria-label="Copy order ID"
                @click="copyOrderId"
              >
                {{ data.orderId }}
              </Button>
            </div>
          </div>

          <Button
            v-if="data.transactionStatus === 'pending'"
            class="w-full mt-6"
            @click="fetchStatus()"
          >
            {{ view.primaryLabel }}
          </Button>
          <Button v-else as-child class="w-full mt-6">
            <NuxtLink :to="view.primaryTo">{{ view.primaryLabel }}</NuxtLink>
          </Button>
        </div>

        <div v-else class="py-6">
          <p class="text-sm text-muted-foreground">Transaction data cannot be displayed.</p>
        </div>

      </CardContent>
    </Card>
  </div>
</template>
