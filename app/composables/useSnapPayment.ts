interface DonationPayload {
  amount: number;
  donorName: string;
  message: string;
  isAnonymous: boolean;
}

export function useSnapPayment(payload: DonationPayload) {
  const config = useRuntimeConfig();

  const isLoading = ref(true);
  const isEmbedRendering = ref(false);
  const isCancelling = ref(false);
  const errorMsg = ref("");
  const hasInitialized = ref(false);
  const currentOrderId = ref("");
  const isCompletedOrRedirecting = ref(false);

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
      script.onerror = () => reject(new Error("Failed to load payment script."));
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

    if (!payload.amount || payload.amount < 10000) {
      errorMsg.value = "Invalid donation data. Please start over from the home page.";
      isLoading.value = false;
      return;
    }

    try {
      await loadSnapScript();

      const { token, orderId } = await $fetch<{ token: string; orderId: string }>("/api/donation", {
        method: "POST",
        body: payload,
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
          errorMsg.value = "You closed the payment window before completing it.";
        },
      });
    } catch (err: any) {
      errorMsg.value = err?.data?.statusMessage || err?.message || "Failed to load payment. Please try again.";
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
      console.warn("Failed to cancel transaction on server:", err);
    }
  }

  async function cancelTransaction() {
    if (isCompletedOrRedirecting.value || !currentOrderId.value) return;
    await performCancel();
  }

  async function handleCancelClick() {
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

  return {
    isLoading,
    isEmbedRendering,
    isCancelling,
    errorMsg,
    handleCancelClick,
  };
}