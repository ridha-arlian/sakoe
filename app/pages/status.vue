<script setup lang="ts">
import { Loader2 } from "@lucide/vue";

type TxStatus = "paid" | "pending" | "failed" | "expired" | "cancelled";

interface DonationStatus {
  orderId: string;
  transactionStatus: TxStatus;
  paymentType: string;
  amount: number;
  transactionTime: string;
}

const route = useRoute();

const orderId = computed(() => (route.query.order_id as string) || "");

const isLoading = ref(true);
const errorMsg = ref("");
const data = ref<DonationStatus | null>(null);

const paymentTypeLabel = computed(() => {
  if (!data.value?.paymentType) return "-";
  const map: Record<string, string> = {
    gopay: "GoPay",
    qris: "QRIS",
    bank_transfer: "Transfer Bank",
    shopeepay: "ShopeePay",
    credit_card: "Kartu Kredit",
  };
  return map[data.value.paymentType] ?? data.value.paymentType;
});

const formattedAmount = computed(() => {
  if (!data.value?.amount) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(data.value.amount);
});

const config: Record<TxStatus, {
  icon: string;
  iconClass: string;
  title: string;
  message: string;
  primaryLabel: string;
  primaryTo: string;
}> = {
  paid: {
    icon: "M4.5 12.75l6 6 9-13.5",
    iconClass: "text-primary bg-primary/10",
    title: "Pembayaran Berhasil",
    message: "Terima kasih atas dukunganmu!",
    primaryLabel: "Kembali ke Beranda",
    primaryTo: "/",
  },
  pending: {
    icon: "M12 6v6l4 2",
    iconClass: "text-amber-500 bg-amber-500/10",
    title: "Menunggu Pembayaran",
    message: "Selesaikan pembayaranmu sebelum waktu habis.",
    primaryLabel: "Cek Ulang",
    primaryTo: "",
  },
  failed: {
    icon: "M6 18L18 6M6 6l12 12",
    iconClass: "text-destructive bg-destructive/10",
    title: "Pembayaran Ditolak",
    message: "Transaksi ditolak oleh penyedia pembayaran.",
    primaryLabel: "Coba Lagi",
    primaryTo: "/",
  },
  expired: {
    icon: "M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    iconClass: "text-muted-foreground bg-muted",
    title: "Waktu Pembayaran Habis",
    message: "Transaksi kedaluwarsa. Silakan buat donasi baru.",
    primaryLabel: "Buat Donasi Baru",
    primaryTo: "/",
  },
  cancelled: {
    icon: "M6 18L18 6M6 6l12 12",
    iconClass: "text-muted-foreground bg-muted",
    title: "Pembayaran Dibatalkan",
    message: "Kamu membatalkan transaksi ini.",
    primaryLabel: "Kembali ke Beranda",
    primaryTo: "/",
  },
};

const view = computed(() => {
  if (!data.value?.transactionStatus) return null;
  return config[data.value.transactionStatus] ?? null;
});

let pollTimer: ReturnType<typeof setInterval> | null = null;
const POLL_INTERVAL = 5000;
const MAX_POLL_ATTEMPTS = 24;
let pollAttempts = 0;

function startPolling() {
  stopPolling();
  pollTimer = setInterval(async () => {
    pollAttempts++;
    if (pollAttempts >= MAX_POLL_ATTEMPTS) {
      stopPolling();
      return;
    }
    await fetchStatus(true);
  }, POLL_INTERVAL);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function fetchStatus(isPoll = false) {
  const currentOrderId = orderId.value;

  if (!currentOrderId) {
    errorMsg.value = "Order ID tidak ditemukan.";
    isLoading.value = false;
    return;
  }

  if (!isPoll) isLoading.value = true;
  errorMsg.value = "";

  try {
    const result = await $fetch<DonationStatus>("/api/status", {
      query: { order_id: currentOrderId },
    });
    
    data.value = result;

    if (result?.transactionStatus === "pending") {
      if (!pollTimer) startPolling();
    } else {
      stopPolling();
    }
  } catch (err: any) {
    console.error("Error fetching status:", err);
    errorMsg.value = err?.data?.statusMessage || err?.message || "Gagal mengambil status transaksi.";
    stopPolling();
  } finally {
    if (!isPoll) isLoading.value = false;
  }
}

function copyOrderId() {
  if (data.value?.orderId) {
    navigator.clipboard.writeText(data.value.orderId);
  }
}

watch(
  orderId,
  (newId) => {
    if (newId) {
      fetchStatus();
    } else {
      errorMsg.value = "Order ID tidak ditemukan pada URL.";
      isLoading.value = false;
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4 py-12">
    <div class="w-full max-w-md">
      <div class="rounded-2xl border border-border bg-card shadow-sm p-8 flex flex-col items-center text-center">
        
        <div v-if="isLoading" class="py-10 flex flex-col items-center gap-3">
          <Loader2 class="w-6 h-6 animate-spin text-primary" />
          <p class="font-inter text-sm text-muted-foreground">Mengecek status transaksi...</p>
        </div>

        <div v-else-if="errorMsg" class="w-full flex flex-col items-center">
          <div class="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
          </div>
          <h1 class="text-xl font-semibold text-foreground">Terjadi Kesalahan</h1>
          <p class="text-sm text-muted-foreground mt-1">{{ errorMsg }}</p>
          <NuxtLink to="/" class="w-full mt-6 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2.5 hover:bg-primary/90 transition-colors">
            Kembali ke Beranda
          </NuxtLink>
        </div>

        <div v-else-if="data && view" class="w-full flex flex-col items-center">
          <div class="h-16 w-16 rounded-full flex items-center justify-center mb-4" :class="view.iconClass">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" :d="view.icon" />
            </svg>
          </div>

          <h1 class="font-inter text-xl font-semibold text-foreground">{{ view.title }}</h1>
          <p class="font-inter text-sm text-muted-foreground mt-1">{{ view.message }}</p>

          <div class="w-full mt-6 rounded-xl bg-muted/50 divide-y divide-border text-left">
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-muted-foreground">Jumlah</span>
              <span class="text-sm font-semibold text-primary">{{ formattedAmount }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-muted-foreground">Metode</span>
              <span class="text-sm font-medium text-foreground">{{ paymentTypeLabel }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-sm text-muted-foreground">Order ID</span>
              <button class="text-sm font-mono text-foreground hover:text-primary transition-colors" @click="copyOrderId">
                {{ data.orderId }}
              </button>
            </div>
          </div>

          <button
            v-if="data.transactionStatus === 'pending'"
            class="w-full mt-6 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2.5 hover:bg-primary/90 transition-colors"
            @click="fetchStatus()"
          >
            {{ view.primaryLabel }}
          </button>
          <NuxtLink
            v-else
            :to="view.primaryTo"
            class="w-full mt-6 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2.5 hover:bg-primary/90 transition-colors"
          >
            {{ view.primaryLabel }}
          </NuxtLink>
        </div>

        <div v-else class="py-6">
          <p class="text-sm text-muted-foreground">Data transaksi tidak dapat ditampilkan.</p>
        </div>

      </div>
    </div>
  </div>
</template>