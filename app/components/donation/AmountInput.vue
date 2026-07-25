<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import { Minus, Plus } from "@lucide/vue";
  import { NumberField, NumberFieldContent, NumberFieldInput } from "@/components/ui/number-field";

  const amount = defineModel<number | undefined>("amount");

  defineProps<{
    isAmountValid: boolean;
    formattedAmount: string;
  }>();

  const emit = defineEmits<{
    increment: [];
    decrement: [];
  }>();

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
        style: "currency",
        currency: "IDR",
        currencyDisplay: "narrowSymbol",
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
          @click="emit("decrement")"
        >
          <Minus class="h-3.5 w-3.5" />
        </Button>

        <NumberFieldInput
          placeholder="Enter amount..."
          class="font-inter font-semibold text-center h-9 text-sm"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          class="h-9 w-9 shrink-0 border-border"
          @click="emit("increment")"
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