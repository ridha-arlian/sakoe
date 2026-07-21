<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
  import { Card } from "@/components/ui/card";
  import { Heart, ShieldCheck, Plus, Minus } from "@lucide/vue";
  import { Checkbox } from "@/components/ui/checkbox";
  import { NumberField, NumberFieldContent, NumberFieldInput } from "@/components/ui/number-field";

  const MIN_AMOUNT  = 10000;
  const amount      = ref<number | undefined>(MIN_AMOUNT);
  const donorName   = ref("");
  const message     = ref("");
  const isAnonymous = ref(false);

  const presets = [
    { label: "Rp 10k", value: 10000 },
    { label: "Rp 25k", value: 25000 },
    { label: "Rp 50k", value: 50000 },
    { label: "Rp 100k", value: 100000 },
  ];

  const isAmountValid = computed(() => {
    return amount.value !== undefined && amount.value >= MIN_AMOUNT;
  });

  function setPreset(val: number) {
    amount.value = val;
  }

  function increment100() {
    const current = amount.value || 0;
    amount.value = current + 100;
  }

  function decrement100() {
    const current = amount.value || 0;
    if (current - 100 >= MIN_AMOUNT) {
      amount.value = current - 100;
    } else {
      amount.value = MIN_AMOUNT;
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const rawVal = target.value.replace(/\D/g, "");
    amount.value = rawVal ? Number(rawVal) : undefined;
  }

  watch(isAnonymous, (newVal) => {
    if (newVal) {
      donorName.value = "Anonim";
    } else {
      donorName.value = "";
    }
  });

  const formattedJumlah = computed(() => {
    if (!amount.value) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount.value);
  });
</script>

<template>
  <Card class="mt-6 w-full max-w-sm bg-card border border-border rounded-xl p-5 text-left shadow-sm flex flex-col gap-4">
    <div>
      <h2 class="font-inter text-base font-semibold text-foreground">
        Traktir aku sesuatu?
      </h2>
    </div>

    <div class="flex flex-col gap-2.5">
      <div class="grid grid-cols-4 gap-2 w-full">
        <Button
          v-for="preset in presets"
          :key="preset.value"
          type="button"
          variant="outline"
          class="font-inter text-xs h-8.5 transition-colors px-0 w-full"
          :class="{ 'border-primary bg-primary/10 text-primary font-medium': amount === preset.value }"
          @click="setPreset(preset.value)"
        >
          {{ preset.label }}
        </Button>
      </div>

      <div>
        <NumberField
          v-model="amount"
          class="font-inter w-full"
          locale="id-ID"
          :min="MIN_AMOUNT"
          :step="1"
          :format-options="{
            style: 'currency',
            currency: 'IDR',
            currencyDisplay: 'narrowSymbol',
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
              @click="decrement100"
            >
              <Minus class="h-3.5 w-3.5" />
            </Button>

            <NumberFieldInput
              placeholder="Masukkan nominal..."
              class="font-inter text-center h-9 text-sm"
              @input="handleInput"
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              class="h-9 w-9 shrink-0 border-border"
              @click="increment100"
            >
              <Plus class="h-3.5 w-3.5" />
            </Button>
          </NumberFieldContent>
        </NumberField>

        <div class="flex items-center justify-between mt-1.5 px-0.5 font-inter text-xs">
          <p class="text-muted-foreground">
            Jumlah: <span class="font-inter font-medium text-foreground">{{ formattedJumlah }}</span>
          </p>

          <p v-if="!isAmountValid" class="font-inter text-destructive font-medium text-[11px]">
            Minimal Rp 10.000
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2.5 pt-3 border-t border-border">
      <Input
        v-model="donorName"
        :disabled="isAnonymous"
        placeholder="Nama kamu (opsional)"
        type="text"
        maxlength="50"
        class="font-inter text-sm h-9 bg-background border-border disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <div class="relative w-full">
        <Textarea
          v-model="message"
          placeholder="Tulis ucapan/dukungan (opsional)..."
          maxlength="200"
          class="font-inter text-sm min-h-20 pb-6 resize-none bg-background border-border"
        />
        <span class="absolute bottom-2 right-2.5 font-inter text-[10px] text-muted-foreground pointer-events-none select-none bg-background/80 px-1 rounded">
          {{ message.length }}/200
        </span>
      </div>

      <label class="inline-flex w-fit font-inter items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground cursor-pointer select-none transition-colors mt-0.5">
        <Checkbox
          id="anonymous"
          v-model="isAnonymous"
          class="h-4 w-4"
        />
        <span>Kirim sebagai anonim</span>
      </label>
    </div>

    <div class="flex flex-col gap-2.5 pt-1">
      <Button 
        :disabled="!isAmountValid"
        class="font-inter w-full h-10 text-sm font-medium gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Heart class="w-4 h-4" />
        Traktir sekarang
      </Button>

      <p class="font-inter text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
        <ShieldCheck class="w-3.5 h-3.5 text-muted-foreground" />
        Transaksi aman &amp; terenkripsi via Midtrans
      </p>
    </div>
  </Card>
</template>