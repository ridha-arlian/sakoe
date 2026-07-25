<script setup lang="ts">
import { Loader2 } from "@lucide/vue";
import { Button } from "@/components/ui/button";

const config = useRuntimeConfig();

const isLoading = ref(true);
const isEmbedRendering = ref(false);
const isCancelling = ref(false);
const errorMsg = ref("");
const hasInitialized = ref(false);
const currentOrderId = ref("");
const isCompletedOrRedirecting = ref(false);

const form = useDonationForm();

const amount = form.value?.amount ?? 0;
const donorName = form.value?.donorName ?? "";
const message = form.value?.message ?? "";
const isAnonymous = form.value?.isAnonymous ?? false;

const formattedAmount = computed(() =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount)
);

let observer: MutationObserver | null = null;

function watchIframeLoad() {
  const container = document.getElementById("snap-container");
  if (!container) return;

  isEmbedRendering.value = true;

  observer = new MutationObserver(() => {
    const iframe = container.querySelector("iframe");
    if (iframe) {
      iframe.addEventListener(
        "load",
        () => {
          isEmbedRendering.value = false;
        },
        { once: true }
      );
      setTimeout(() => {
        isEmbedRendering.value = false;
      }, 4000);

      observer?.disconnect();
      observer = null;
    }
  });

  observer.observe(container, { childList: true });
}

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

function redirectToStatus() {
  if (!currentOrderId.value) return;
  navigateTo({
    path: "/status",
    query: { order_id: currentOrderId.value },
  });
}

function handleRedirectToStatus() {
  isCompletedOrRedirecting.value = true;
  closeSnap();
  redirectToStatus();
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
      body: { amount, donorName, message, isAnonymous },
    });

    currentOrderId.value = orderId;
    isLoading.value = false;
    await nextTick();

    watchIframeLoad();

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

async function performCancel() {
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

async function cancelTransaction() {
  if (isCompletedOrRedirecting.value || !currentOrderId.value) return;
  await performCancel();
}

async function handleCancelClick(e: Event) {
  e.preventDefault();

  if (isCancelling.value) return;

  if (!currentOrderId.value) {
    navigateTo("/");
    return;
  }

  isCancelling.value = true;
  isCompletedOrRedirecting.value = true;
  await performCancel();
  redirectToStatus();
}

onBeforeRouteLeave(() => {
  cancelTransaction();
});

onMounted(() => {
  initPayment();
});

onUnmounted(() => {
  observer?.disconnect();
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

    <div v-if="!isLoading && !errorMsg" class="relative w-full max-w-md" style="min-height: 600px;">
      <div
        v-if="isEmbedRendering"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm rounded-xl"
      >
        <Loader2 class="w-6 h-6 animate-spin text-primary" />
        <p class="font-inter text-sm text-muted-foreground">Membuka jendela pembayaran...</p>
      </div>
      <div id="snap-container" class="snap-embed-container" />
    </div>

    <div class="w-full max-w-md rounded-2xl border border-border bg-card shadow-sm p-4 text-center">
      <Button as-child class="w-full" variant="outline" :disabled="isCancelling">
        <NuxtLink to="/" @click="handleCancelClick">
          <Loader2 v-if="isCancelling" class="w-4 h-4 animate-spin mr-2" />
          {{ isCancelling ? "Membatalkan..." : "Batalkan pembayaran" }}
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