<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
  import { Heart, ShieldCheck } from "@lucide/vue";
</script>

<template>
  <section class="relative flex flex-col items-center text-center px-6 pt-16 pb-12 overflow-hidden">

    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute inset-0 bg-linear-gradient(to_right,theme(colors.zinc.100)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.zinc.100)_1px,transparent_1px) bg-48px dark:bg-linear-gradient(to_right,theme(colors.zinc.800/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.zinc.800/40)_1px,transparent_1px)" />
      <div class="absolute inset-0 from-transparent via-transparent to-background"/>
    </div>

    <div class="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-sm text-left">
      <div class="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-b border-border">
        <img 
          src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3V2MGVweXpyMmt1OW15c2dwYXJpaWZsOHVkZG4yZDd2NmM1cDF3ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Wj7lNjMNDxSmc/giphy.gif" 
          alt="CodeBrew Profile GIF" 
          class="w-full h-full object-cover"/>
        
        <div class="absolute top-3 left-3 px-2 py-0.5 select-none">
          <span class="text-[11px] font-bold tracking-wider text-black font-mono uppercase">
            sakuuuu
          </span>
        </div>
      </div>
    </div>

    <!-- <div class="mt-6 flex gap-4 flex-wrap justify-center">
      <div class="flex flex-col items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-muted-foreground select-none">
          Supporter
        </span>
        <div class="flex items-center justify-center px-4 py-2 rounded-xl bg-card border border-border min-h-40px shadow-sm">
          <div class="text-sm font-semibold text-foreground leading-none">400</div>
        </div>
      </div>

      <div class="flex flex-col items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-muted-foreground select-none">
          Terkumpul
        </span>
        <div class="flex items-center justify-center px-4 py-2 rounded-xl bg-card border border-border min-h-40px shadow-sm">
          <div class="text-sm font-semibold text-foreground leading-none">Rp 2.500.345</div>
        </div>
      </div>

      <div class="flex flex-col items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-muted-foreground select-none">
          Goals aktif
        </span>
        <div class="flex items-center justify-center px-4 py-2 rounded-xl bg-card border border-border min-h-40px shadow-sm">
          <div class="text-sm font-semibold text-foreground leading-none">Rp 10.000.000</div>
        </div>
      </div>
    </div> -->
    <div class="mt-6 flex gap-4 flex-wrap justify-center w-full max-w-sm mx-auto">
      <div class="flex-1 min-w-100px flex flex-col items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-muted-foreground select-none whitespace-nowrap">
          Supporter
        </span>
        <div class="w-full h-11 flex items-center justify-center px-3 rounded-xl bg-card border border-border shadow-sm">
          <div class="text-sm font-semibold text-foreground leading-none truncate">400</div>
        </div>
      </div>

      <div class="flex-1 min-w-100px flex flex-col items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-muted-foreground select-none whitespace-nowrap">
          Terkumpul
        </span>
        <div class="w-full h-11 flex items-center justify-center px-3 rounded-xl bg-card border border-border shadow-sm">
          <div class="text-[13px] font-semibold text-foreground leading-none truncate">Rp 2.500.345</div>
        </div>
      </div>

      <div class="flex-1 min-w-100px flex flex-col items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-muted-foreground select-none whitespace-nowrap">
          Goals aktif
        </span>
        <div class="w-full h-11 flex items-center justify-center px-3 rounded-xl bg-card border border-border shadow-sm">
          <div class="text-[13px] font-semibold text-foreground leading-none truncate">Rp 10.000.000</div>
        </div>
      </div>
    </div>

    <Card class="mt-8 w-full max-w-sm bg-card border border-border rounded-xl p-4 text-left shadow-sm">
      <CardHeader class="p-0 mb-3">
        <h2 class="text-lg font-semibold text-foreground">
          Traktir kopi ☕
        </h2>
      </CardHeader>

      <CardContent class="flex gap-2 mb-3 justify-center">
        <Button>Rp 10k</Button>
        <Button>Rp 25k</Button>
        <Button>Rp 50k</Button>
        <Button>Rp 100k</Button>
      </CardContent>

      <Input placeholder="Atau masukkan jumlah sendiri..." type="number" class="mb-3 text-sm h-9" />

      <CardFooter class="flex flex-col gap-2">
        <Button class="w-full h-10 text-sm font-medium gap-2">
          <Heart class="w-4 h-4" />
          Traktir sekarang
        </Button>

        <p class="mt-2.5 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
          <ShieldCheck class="w-3 h-3" />
          Transaksi aman &amp; terenkripsi via Midtrans
        </p>
      </CardFooter>
    </Card>

  </section>
</template>