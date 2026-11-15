<script setup lang="ts">
  import { Loader2 } from "@lucide/vue";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardFooter } from "@/components/ui/card";
  import { Alert, AlertDescription } from "@/components/ui/alert";

  const form = useDonationForm();

  definePageMeta({ middleware: "donation-draft", ssr: false });

  useSeoMeta({ title: "Checkout | Sakoe", robots: "noindex, nofollow" });

  const draft = form.value!;

  const amount = draft.amount;
  const donorName = draft.donorName;
  const message = draft.message;
  const isAnonymous = draft.isAnonymous;

  const formattedAmount = computed(() => formatIDR(amount));

  const { isLoading, isEmbedRendering, isCancelling, errorMsg, handleCancelClick } = useSnapPayment({
    amount,
    donorName,
    message,
    isAnonymous,
  });
</script>

<template>
  <div class="min-h-dvh flex flex-col items-center bg-background px-4 py-12 gap-4">
    <Card class="w-full max-w-md">
      <CardContent class="text-center">
        <p class="text-sm text-muted-foreground">Completing payment</p>
        <p class="text-lg font-semibold text-foreground mt-0.5">{{ formattedAmount }}</p>
      </CardContent>
    </Card>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 class="size-6 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground">Preparing payment...</p>
    </div>

    <Alert v-if="errorMsg" variant="destructive" class="w-full max-w-md">
      <AlertDescription class="text-center">
        {{ errorMsg }}
      </AlertDescription>
    </Alert>

    <div v-if="!isLoading && !errorMsg" class="relative w-full max-w-md" style="min-height: 600px;">
      <div v-if="isEmbedRendering" class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm rounded-xl">
        <Loader2 class="size-6 animate-spin text-primary" />
        <p class="text-sm text-muted-foreground">Opening payment window...</p>
      </div>
      <div id="snap-container" class="snap-embed-container" />
    </div>

    <Card class="w-full max-w-md">
      <CardFooter>
        <Button
          variant="outline"
          class="w-full"
          :disabled="isCancelling"
          @click="handleCancelClick"
        >
          <Loader2 v-if="isCancelling" class="animate-spin" />
          {{ isCancelling ? "Cancelling..." : "Cancel payment" }}
        </Button>
      </CardFooter>
    </Card>
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
