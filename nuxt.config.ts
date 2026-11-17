import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css', 'vue-sonner/style.css'],
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
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Sakoe | Fuel the Work',
      meta: [
        {
          name: 'description',
          content: 'Support Sakoe with a quick, secure donation through Tako. Every contribution keeps the projects going.',
        },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    },
  },
  colorMode: {
    classSuffix: ''
  },
  nitro: {
    preset: 'cloudflare_module',
  },
  routeRules: {
    '/api/stats': {
      swr: 10,
      headers: { 'cache-control': 'public, max-age=10, stale-while-revalidate=40' },
    },
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Frame-Options': 'SAMEORIGIN',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
  },
  fonts: {
    families: [
      { name: 'Sansation', provider: 'google' },
      { name: 'Inter', provider: 'google' },
    ]
  },
  runtimeConfig: {
    takoApiKey: '',
    takoCallbackSecret: '',
    takoUsername: 'ridha_arlian',
    takoUserAgent: 'Sakoe/1.0',
  },
})