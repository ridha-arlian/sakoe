<template>  
  <main class="min-h-screen bg-background text-foreground transition-colors duration-300 relative scrollbar-hide overflow-y-auto h-screen">
    <div class="absolute top-4 right-4 z-50">
      <ModeToggle />
    </div>
    <div class="max-w-xl mx-auto">
      <section class="relative flex flex-col items-center text-center px-6 pt-16 pb-12 overflow-hidden">
        <profileBanner />
        <statsRow />
        <donationCard />
      </section>
    </div>
  </main>
</template>