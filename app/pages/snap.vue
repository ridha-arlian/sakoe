<script setup lang="ts">
import { Loader2 } from "@lucide/vue";
import { Button } from "@/components/ui/button";

const route = useRoute();
const config = useRuntimeConfig();

const isLoading = ref(true);
const errorMsg = ref("");
const hasInitialized = ref(false);
const currentOrderId = ref("");

const isCompletedOrRedirecting = ref(false);

const amount = Number(route.query.amount) || 0;
const donorName = (route.query.donorName as string) || "";
const message = (route.query.message as string) || "";

const formattedAmount = computed(() =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount)
);

function loadSnapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve();

    const script = document.createElement("script");
    script.src = config.public.midtransSnapUrl as string;
    script.setAttribute("data-client-key", config.public.midtransClientSandbox as string);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat script pembayaran."));
    document.head.appendChild(script);
  });
}

function closeSnap() {
  if (window.snap?.hide) {
    window.snap.hide();
  }
}

function handleRedirectToStatus() {
  if (!currentOrderId.value) return;
  
  isCompletedOrRedirecting.value = true;
  closeSnap();

  navigateTo({
    path: "/status",
    query: { order_id: currentOrderId.value },
  });
}

async function initPayment() {
  if (hasInitialized.value) return;
  hasInitialized.value = true;

  if (!amount || amount < 10000) {
    errorMsg.value = "Data donasi tidak valid. Silakan ulangi dari halaman utama.";
    isLoading.value = false;
    return;
  }

  try {
    await loadSnapScript();

    const { token, orderId } = await $fetch<{ token: string; orderId: string }>("/api/donation", {
      method: "POST",
      body: { amount, donorName, message },
    });

    currentOrderId.value = orderId;
    isLoading.value = false;
    await nextTick();

    window.snap.embed(token, {
      embedId: "snap-container",
      onSuccess() {
        handleRedirectToStatus();
      },
      onPending() {
        handleRedirectToStatus();
      },
      onError() {
        handleRedirectToStatus();
      },
      onClose() {
        errorMsg.value = "Kamu menutup jendela pembayaran sebelum selesai.";
      },
    });
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || "Gagal memuat pembayaran. Coba lagi.";
    isLoading.value = false;
  }
}

async function cancelTransaction() {
  if (isCompletedOrRedirecting.value || !currentOrderId.value) return;

  closeSnap();

  try {
    await $fetch("/api/cancel", {
      method: "POST",
      body: { orderId: currentOrderId.value },
    });
  } catch (err) {
    console.warn("Gagal membatalkan transaksi di server:", err);
  }
}

onBeforeRouteLeave(() => {
  cancelTransaction();
});

onMounted(() => {
  initPayment();
});
</script>

<template>
  <div class="min-h-screen flex flex-col items-center bg-background px-4 py-12">
    <div class="w-full max-w-md rounded-2xl border border-border bg-card shadow-sm p-5 text-center">
      <p class="font-inter text-sm text-muted-foreground">Menyelesaikan pembayaran</p>
      <p class="font-inter text-lg font-semibold text-foreground mt-0.5">{{ formattedAmount }}</p>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 class="w-6 h-6 animate-spin text-primary" />
      <p class="font-inter text-sm text-muted-foreground">Menyiapkan pembayaran...</p>
    </div>

    <p v-if="errorMsg" class="font-inter text-center text-sm text-destructive py-8">
      {{ errorMsg }}
    </p>

    <div id="snap-container" class="snap-embed-container" />

    <div class="w-full max-w-md rounded-2xl border border-border bg-card shadow-sm p-4 text-center">
      <Button as-child class="w-full" variant="outline">
        <NuxtLink to="/" @click="cancelTransaction">
          Batalkan dan kembali ke beranda
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.snap-embed-container {
  width: 100%;
  max-width: 28rem;
  margin: 1.5rem 0;
}

.snap-embed-container :deep(iframe) {
  width: 100% !important;
  min-height: 600px;
  border: none;
}
</style>