<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import { AMOUNT_PRESETS } from "@/utils/donation";

  const amount = defineModel<number | undefined>({ required: true });

  function setPreset(value: number) {
    amount.value = value;
  }
</script>

<template>
  <div class="grid grid-cols-4 gap-2 w-full">
    <Button
      v-for="preset in AMOUNT_PRESETS"
      :key="preset.value"
      type="button"
      variant="outline"
      class="font-semibold text-xs h-8.5 transition-colors px-0 w-full"
      :class="{ 'border-primary bg-primary/10 text-primary': amount === preset.value }"
      @click="setPreset(preset.value)"
    >
      {{ preset.label }}
    </Button>
  </div>
</template>
