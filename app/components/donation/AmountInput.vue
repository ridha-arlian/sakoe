<script setup lang="ts">
  import { computed } from "vue";
  import { Button } from "@/components/ui/button";
  import { Plus, Minus } from "@lucide/vue";
  import { NumberField, NumberFieldContent, NumberFieldInput } from "@/components/ui/number-field";
  import { MAX_AMOUNT, MIN_AMOUNT } from "~~/shared/donation";
  import { formatIDR } from "@/utils/currency";

  const amount = defineModel<number | undefined>({ required: true });

  const isAmountValid = computed(() => amount.value !== undefined && amount.value >= MIN_AMOUNT);

  function increment100() {
    amount.value = (amount.value || 0) + 100;
  }

  function decrement100() {
    const next = (amount.value || 0) - 100;
    amount.value = next >= MIN_AMOUNT ? next : MIN_AMOUNT;
  }

  const formattedAmount = computed(() => {
    return amount.value ? formatIDR(amount.value) : "Rp 0";
  });
</script>

<template>
  <div>
    <NumberField
      v-model="amount"
      class="w-full"
      locale="id-ID"
      :min="MIN_AMOUNT"
      :max="MAX_AMOUNT"
      :step="1"
      :format-options="{
        style: 'currency',
        currency: 'IDR',
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: 0,
      }"
    >
      <NumberFieldContent class="w-full relative flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="size-9 shrink-0"
          :disabled="amount !== undefined && amount <= MIN_AMOUNT"
          @click="decrement100"
        >
          <Minus />
        </Button>

        <NumberFieldInput
          placeholder="Enter amount..."
          class="font-semibold text-center text-sm"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          class="size-9 shrink-0"
          @click="increment100"
        >
          <Plus />
        </Button>
      </NumberFieldContent>
    </NumberField>

    <div class="flex items-center justify-between mt-1.5 px-0.5 text-xs">
      <p class="text-muted-foreground">
        Amount: <span class="font-semibold text-xs text-foreground">{{ formattedAmount }}</span>
      </p>

      <p v-if="!isAmountValid" class="text-destructive font-medium text-[11px]">
        Minimum Rp 10,000
      </p>
    </div>
  </div>
</template>
