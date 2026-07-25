<script setup lang="ts">
  import { computed } from "vue";
  import { Progress } from "@/components/ui/progress";

  const { data } = await useStatsPolling();

  const totalCollected = computed(() => data.value?.totalCollected ?? 0);
  const totalSupporters = computed(() => data.value?.totalSupporters ?? 0);

  const progressPercentage = computed(() => {
    if (!TARGET_GOAL || TARGET_GOAL <= 0) return 0;
    const percent = (totalCollected.value / TARGET_GOAL) * 100;
    return Math.min(Math.round(percent), 100);
  });
</script>

<template>
  <div class="mt-6 flex gap-4 flex-wrap justify-center w-full max-w-sm mx-auto">
    <div class="order-2 w-[calc(50%-0.5rem)] flex flex-col items-center gap-2">
      <span class="font-inter px-2.5 py-0.5 rounded-full bg-muted border border-border dark:border-border text-xs font-medium text-muted-foreground select-none whitespace-nowrap">
        Collected
      </span>
      <div class="w-full h-11 flex items-center justify-center px-3 rounded-xl bg-card border border-border shadow-sm">
        <div class="font-inter text-md font-semibold text-foreground dark:text-foreground leading-none truncate">
          {{ formatIDR(totalCollected) }}
        </div>
      </div>
    </div>

    <div class="order-2 w-[calc(50%-0.5rem)] flex flex-col items-center gap-2">
      <span class="font-inter px-2.5 py-0.5 rounded-full bg-muted border border-border dark:border-border text-xs font-medium text-muted-foreground select-none whitespace-nowrap">
        Active goal
      </span>
      <div class="w-full h-11 flex items-center justify-center px-3 rounded-xl bg-card border border-border shadow-sm relative overflow-hidden">
        <Progress
          :model-value="progressPercentage"
          class="absolute inset-0 h-full w-full rounded-none bg-transparent [&>div]:bg-primary/20 transition-all"
        />
        <div class="font-inter text-md font-semibold text-foreground leading-none truncate z-10">
          {{ formatIDR(TARGET_GOAL) }}
        </div>
      </div>
    </div>

    <div class="order-3 w-[calc(50%-0.5rem)] flex flex-col items-center gap-2">
      <span class="font-inter px-2.5 py-0.5 rounded-full bg-muted border border-border dark:border-border text-xs font-medium text-muted-foreground select-none whitespace-nowrap">
        Supporters
      </span>
      <div class="w-full h-11 flex items-center justify-center px-3 rounded-xl bg-card border border-border shadow-sm">
        <div class="font-inter text-md font-semibold text-foreground leading-none truncate">
          {{ totalSupporters }}
        </div>
      </div>
    </div>
  </div>
</template>