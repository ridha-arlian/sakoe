import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['shadcn-nuxt', '@nuxt/eslint', '@nuxt/fonts', '@nuxtjs/color-mode'],
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui'
  },
  colorMode: {
    classSuffix: ''
  },
  fonts: {
    families: [
      { name: 'Sansation', provider: 'google' },
      { name: 'Roboto', provider: 'google' },
    ]
  },
  runtimeConfig: {
    "midtransServerSandbox": process.env.MIDTRANS_SERVER_KEY_SANDBOX,
    "midtransClientSandbox": process.env.MIDTRANS_CLIENT_KEY_SANDBOX,
    public: {
      "midtransClientSandbox": process.env.MIDTRANS_CLIENT_KEY_SANDBOX,
      "midtransClient": process.env.MIDTRANS_CLIENT_KEY,
    }
  },
})