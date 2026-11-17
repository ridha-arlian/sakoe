<script setup lang="ts">
  import { ExternalLink, Loader2, LockKeyhole } from "@lucide/vue";
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
  import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
  import { Input } from "@/components/ui/input";
  import { Separator } from "@/components/ui/separator";
  import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
  import {
    isTakoPaymentMethod,
    PAYMENT_METHOD_LABELS,
    TAKO_PAYMENT_METHODS,
    type TakoPaymentMethod,
  } from "~~/shared/donation";

  const form = useDonationForm();

  definePageMeta({ middleware: "donation-draft", ssr: false });

  useSeoMeta({ title: "Checkout | Sakoe", robots: "noindex, nofollow" });

  const draft = form.value!;

  const amount = draft.amount;
  const donorName = draft.donorName;
  const message = draft.message;
  const isAnonymous = draft.isAnonymous;

  const email = ref(draft.email);
  const paymentMethod = ref<TakoPaymentMethod>(draft.paymentMethod);

  const formattedAmount = computed(() => formatIDR(amount));
  const displayName = computed(() => (isAnonymous ? "Anonymous" : donorName || "Anonymous"));
  const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
  const showEmailError = computed(() => email.value.trim().length > 0 && !isEmailValid.value);

  const { isRedirecting, errorMsg, startPayment } = useTakoPayment();

  function persistDraft() {
    if (!form.value) return;

    form.value = {
      ...form.value,
      email: email.value.trim(),
      paymentMethod: paymentMethod.value,
    };
    saveDonationDraft(form.value);
  }

  function updatePaymentMethod(value: unknown) {
    if (isTakoPaymentMethod(value)) {
      paymentMethod.value = value;
      persistDraft();
    }
  }

  async function handlePay() {
    if (!isEmailValid.value || isRedirecting.value) return;

    persistDraft();

    await startPayment({
      amount,
      donorName,
      message,
      isAnonymous,
      email: email.value.trim(),
      paymentMethod: paymentMethod.value,
    });
  }
</script>

<template>
  <div class="min-h-dvh flex flex-col items-center bg-background px-4 py-12 gap-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
        <CardDescription>Review your donation before paying.</CardDescription>
      </CardHeader>

      <CardContent class="flex flex-col gap-5">
        <div class="rounded-xl bg-muted/50 px-4">
          <div class="flex items-center justify-between py-3">
            <span class="text-sm text-muted-foreground">Amount</span>
            <Badge variant="secondary">{{ formattedAmount }}</Badge>
          </div>
          <Separator />
          <div class="flex items-center justify-between py-3">
            <span class="text-sm text-muted-foreground">From</span>
            <span class="text-sm font-medium text-foreground">{{ displayName }}</span>
          </div>
          <template v-if="message">
            <Separator />
            <div class="py-3">
              <p class="text-sm text-foreground whitespace-pre-wrap break-words">{{ message }}</p>
            </div>
          </template>
        </div>

        <FieldGroup class="gap-4">
          <Field :data-invalid="showEmailError">
            <FieldLabel for="email" class="text-[13px]">Email</FieldLabel>
            <Input
              id="email"
              v-model="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="you@example.com"
              :maxlength="254"
              :aria-invalid="showEmailError"
              class="text-sm"
            />
            <FieldError v-if="showEmailError">Enter a valid email address.</FieldError>
            <FieldDescription v-else>
              Used by Tako for the payment receipt. Your name can stay anonymous.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel class="text-[13px]">Payment method</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              :model-value="paymentMethod"
              class="grid w-full grid-cols-2"
              @update:model-value="updatePaymentMethod"
            >
              <ToggleGroupItem
                v-for="method in TAKO_PAYMENT_METHODS"
                :key="method"
                :value="method"
                class="w-full justify-center"
              >
                {{ PAYMENT_METHOD_LABELS[method] }}
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>
        </FieldGroup>

        <Alert v-if="errorMsg" variant="destructive">
          <AlertDescription>{{ errorMsg }}</AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter class="flex-col gap-2.5">
        <Button
          class="w-full"
          :disabled="!isEmailValid || isRedirecting"
          @click="handlePay"
        >
          <Loader2 v-if="isRedirecting" data-icon="inline-start" class="animate-spin" />
          <ExternalLink v-else data-icon="inline-start" />
          {{ isRedirecting ? "Redirecting to Tako..." : "Pay with Tako" }}
        </Button>

        <p class="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
          <LockKeyhole class="size-3.5" />
          You will be redirected to Tako to complete payment
        </p>

        <Button variant="ghost" size="sm" as-child class="w-full">
          <NuxtLink to="/">Change donation</NuxtLink>
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
