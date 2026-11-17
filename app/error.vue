<script setup lang="ts">
  import type { NuxtError } from "#app";
  import { Button } from "@/components/ui/button";

  const props = defineProps<{ error: NuxtError }>();
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md rounded-2xl border border-border bg-card shadow-sm p-8 text-center">
      <p class="text-5xl font-semibold text-primary">{{ props.error.statusCode }}</p>
      <h1 class="text-lg font-semibold text-foreground mt-2">{{ props.error.message }}</h1>

      <div class="flex flex-col gap-2 mt-6">
        <Button class="w-full" @click="clearError({ redirect: '/' })">
          Back to home
        </Button>
      </div>
    </div>
  </div>
</template>
