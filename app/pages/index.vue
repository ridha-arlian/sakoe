<script setup lang="ts">
  useSeoMeta({
    title: "Sakoe | Fuel the Work",
    description: "Support Sakoe with a quick, secure donation through Midtrans. Every contribution keeps the projects going.",
    ogTitle: "Sakoe | Fuel the Work",
    ogDescription: "Support Sakoe with a quick, secure donation through Midtrans. Every contribution keeps the projects going.",
    ogImage: "/og-image.png",
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