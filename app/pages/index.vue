<script setup lang="ts">
  useSeoMeta({
    ogTitle: "Sakoe | Fuel the Work",
    ogDescription: "Support Sakoe with a quick, secure donation through Tako. Every contribution keeps the projects going.",
    ogImage: "/logo.svg",
    ogImageAlt: "Sakoe",
  });
</script>

<template>  
  <main class="min-h-dvh bg-background text-foreground transition-colors duration-300 relative">
    <div class="max-w-xl mx-auto">
      <section class="relative flex flex-col items-center text-center px-6 pt-16 pb-12 overflow-hidden">
        <profileBanner />
        <statsRow />
        <donationCard />
      </section>
    </div>
  </main>
</template>