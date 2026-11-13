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
  nitro: {
    preset: 'cloudflare_module',
  },
  fonts: {
    families: [
      { name: 'Sansation', provider: 'google' },
      { name: 'Roboto', provider: 'google' },
    ]
  },
  runtimeConfig: {
    midtransServerKey: '',
    midtransIsProduction: '',
    public: {
      midtransClientKey: '',
      midtransSnapUrl: '',
    },
  },
})