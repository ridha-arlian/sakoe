<script setup lang="ts">
  import { Toaster } from "@/components/ui/sonner";
</script>

<template>
  <div class="min-h-dvh bg-background text-foreground">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <div class="fixed top-4 right-4 z-50">
      <ModeToggle />
    </div>
    <slot />
    <Toaster rich-colors position="top-center" />
  </div>
</template>
