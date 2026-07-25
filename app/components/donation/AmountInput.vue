<script setup lang="ts">
  import { computed } from "vue";
  import { Button } from "@/components/ui/button";
  import { Plus, Minus } from "@lucide/vue";
  import { NumberField, NumberFieldContent, NumberFieldInput } from "@/components/ui/number-field";
  import { MIN_AMOUNT } from "@/utils/donation";
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

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const rawVal = target.value.replace(/\D/g, "");
    amount.value = rawVal ? Number(rawVal) : undefined;
  }

  const formattedAmount = computed(() => {
    return amount.value ? formatIDR(amount.value) : "Rp 0";
  });

  defineExpose({ isAmountValid });
</script>

<template>
  <div>
    <NumberField
      v-model="amount"
      class="font-inter w-full"
      locale="id-ID"
      :min="MIN_AMOUNT"
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
          class="h-9 w-9 shrink-0 border-border"
          :disabled="amount !== undefined && amount <= MIN_AMOUNT"
          @click="decrement100"
        >
          <Minus class="h-3.5 w-3.5" />
        </Button>

        <NumberFieldInput
          placeholder="Enter amount..."
          class="font-inter font-semibold text-center h-9 text-sm"
          @input="handleInput"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          class="h-9 w-9 shrink-0 border-border"
          @click="increment100"
        >
          <Plus class="h-3.5 w-3.5" />
        </Button>
      </NumberFieldContent>
    </NumberField>

    <div class="flex items-center justify-between mt-1.5 px-0.5 font-inter text-xs">
      <p class="text-muted-foreground">
        Amount: <span class="font-inter font-semibold text-xs text-foreground">{{ formattedAmount }}</span>
      </p>

      <p v-if="!isAmountValid" class="font-inter text-destructive font-medium text-[11px]">
        Minimum Rp 10,000
      </p>
    </div>
  </div>
</template>