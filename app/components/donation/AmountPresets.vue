<script setup lang="ts">
  import { Button } from "@/components/ui/button";

  const amount = defineModel<number | undefined>("amount");
</script>

<template>
  <div class="grid grid-cols-4 gap-2 w-full">
    <Button
      v-for="preset in AMOUNT_PRESETS"
      :key="preset.value"
      type="button"
      variant="outline"
      class="font-inter font-semibold text-xs h-8.5 transition-colors px-0 w-full"
      :class="{ 'border-primary bg-primary/10 text-primary font-inter font-semibold text-xs': amount === preset.value }"
      @click="amount = preset.value"
    >
      {{ preset.label }}
    </Button>
  </div>
</template>