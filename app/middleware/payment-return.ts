import { shouldShowReturnPage } from '@/utils/payment-return'

export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client || to.path !== '/checkout') {
    return
  }

  if (shouldShowReturnPage()) {
    return navigateTo('/payment-incomplete', { replace: true })
  }
})
