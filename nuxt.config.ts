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
  modules: [
    'shadcn-nuxt',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
  ],
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
    "midtransServerKey": process.env.MIDTRANS_SERVER_KEY,
    public: {
      "midtransClientKey": process.env.MIDTRANS_CLIENT_KEY,
      "midtransSnapUrl": process.env.MIDTRANS_SNAP_URL
    }
  },
})