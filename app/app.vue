<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">

  const midtransClient = useRuntimeConfig().public.midtransClientSandbox
  const midtransLink = 'https://app.sandbox.midtrans.com/snap/snap.js'
  
  useHead({
    script: [{
      src: midtransLink,
      'data-client-key': midtransClient,
      async: true,
    }]
  })

</script>